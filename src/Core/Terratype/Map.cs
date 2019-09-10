using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Web;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Terratype.ColorFilters;
using Terratype.CoordinateDisplays;
using Terratype.CoordinateSystems;
using Terratype.Icons;
using Terratype.Labels;
using Terratype.Providers;
using Terratype.Query;
using Umbraco.Core.Services;

namespace Terratype
{
	[DebuggerDisplay("{Position},{Zoom}")]
	[JsonObject(MemberSerialization.OptIn)]
	[JsonConverter(typeof(MapConvertor))]
	public class Map : IMap
	{
		/// <summary>
		/// Which display coordinate system is this map using to render
		/// </summary>
		[JsonProperty(PropertyName = "coordinateDisplay")]
		public ICoordinateDisplay CoordinateDisplay { get; internal set; }

		/// <summary>
		/// Which provider is this map using to render
		/// </summary>
		[JsonProperty(PropertyName = "provider")]
		public IProvider Provider { get; internal set; }

		/// <summary>
		/// Where is this map pointing to
		/// </summary>
		[JsonProperty(PropertyName = "position")]
		public IPosition Position { get; set; }

		/// <summary>
		/// Image marker to display this location on the map
		/// </summary>
		[JsonProperty(PropertyName = "icon")]
		public Icon Icon { get; internal set; }

		/// <summary>
		/// Current map zoom
		/// </summary>
		[JsonProperty(PropertyName = "zoom")]
		public int Zoom { get; set; }

		/// <summary>
		/// Last search request
		/// </summary>
		[JsonProperty(PropertyName = "searchText")]
		public string SearchText { get; set; }

		/// <summary>
		/// Last search address, might not match current position
		/// </summary>
		[JsonProperty(PropertyName = "address")]
		public Address Address { get; internal set; }

		/// <summary>
		/// Label
		/// </summary>
		[JsonProperty(PropertyName = "label")]
		public ILabel Label { get; set; }

		/// <summary>
		/// Color filters appied to map
		/// </summary>
		[JsonProperty(PropertyName = "colorFilters")]
		public IEnumerable<IColorFilter> ColorFilters { get; set; }

		[JsonProperty(PropertyName = "height")]
		public int Height { get; set; }

		public Map()
		{

		}

		public Map(IMap other)
		{
			CoordinateDisplay = other.CoordinateDisplay;
			Provider = other.Provider;
			Position = other.Position;
			Zoom = other.Zoom;
			SearchText = other.SearchText;
			Address = other.Address;
			Icon = other.Icon;
			Label = other.Label;
			Height = other.Height;
			ColorFilters = other.ColorFilters;
		}

		public Map(string json) : this(JsonConvert.DeserializeObject<Map>(json))
		{
		}

		public Map(JObject data) : this(data.ToObject<Map>())
		{
		}

		private const string guid = "d9e9e352-7d33-46d3-b909-8b6e88b63ae4";
		private static int Counter
		{
			get
			{
				var c = HttpContext.Current.Items[guid] as int?;
				if (c == null)
				{
					c = 131072;
				}
				else
				{
					c++;
				}
				HttpContext.Current.Items[guid] = c;
				return (int)c;
			}
		}
	}

	public class MapConvertor : JsonConverter
	{
		public override bool CanWrite
		{
			get
			{
				return false;
			}
		}

		public override bool CanConvert(Type objectType)
		{
			return typeof(Map).IsAssignableFrom(objectType);
		}

		private JObject Definition(JObject obj)
		{
			var token = obj.GetValue("datatypeId", StringComparison.InvariantCultureIgnoreCase);
			if (token == null)
			{
				return null;
			}

			int id = 0;
			Guid guid = Guid.Empty;
			switch (token.Type)
			{
				case JTokenType.Guid:
					guid = token.Value<Guid>();
					break;

				case JTokenType.Integer:
					id = token.Value<int>();
					break;

				case JTokenType.String:
					var text = token.Value<string>();
					if (!int.TryParse(text, out id))
					{
						Guid.TryParse(text, out guid);
					}
					break;
			}

			string json = null;
			if (id != 0)
			{
				var container = new LightInject.ServiceContainer();
				var dataTypeService = container.GetInstance(typeof(IDataTypeService)) as IDataTypeService;
				var dataType = dataTypeService.GetDataType(token.Value<int>());
				json = dataType.Configuration as string;
			}
			else if (guid != Guid.Empty)
			{
				var container = new LightInject.ServiceContainer();
				var dataTypeService = container.GetInstance(typeof(IDataTypeService)) as IDataTypeService;
				var dataType = dataTypeService.GetDataType(token.Value<Guid>());
				json = dataType.Configuration as string;
			}
			else
			{
				return null;
			}
			return JObject.Parse(json);
		}

		public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
		{
			var model = new Map();

			JObject item = JObject.Load(reader);
			model.SearchText = item.GetValue(Json.PropertyName<Map>(nameof(Map.SearchText)), StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
			model.Zoom = item.GetValue(Json.PropertyName<Map>(nameof(Map.Zoom)), StringComparison.InvariantCultureIgnoreCase)?.Value<int>() ?? 0;
			model.Height = item.GetValue(Json.PropertyName<Map>(nameof(Map.Height)), StringComparison.InvariantCultureIgnoreCase)?.Value<int>() ?? 400;

			var definition = Definition(item);
			if (definition != null)
			{
				var config = definition.GetValue("config", StringComparison.InvariantCultureIgnoreCase) as JObject;
				if (config != null)
				{
					model.Height = config.GetValue(Json.PropertyName<Map>(nameof(Map.Height)), StringComparison.InvariantCultureIgnoreCase)?.Value<int>() ?? 0;
					model.Icon = new Icon(config.GetValue(Json.PropertyName<Map>(nameof(Map.Icon)), StringComparison.InvariantCultureIgnoreCase).ToObject<Icon>());
					var provider = config.GetValue(Json.PropertyName<Map>(nameof(Map.Provider)), StringComparison.InvariantCultureIgnoreCase);
					if (provider != null)
					{
						var field = provider.First as JProperty;
						while (field != null)
						{
							if (String.Equals(field.Name, nameof(IProvider.Id), StringComparison.InvariantCultureIgnoreCase))
							{
								var instance = ProviderBase.GetInstance<IProvider>(field.Value.ToObject<string>());
								model.Provider = (IProvider)config.GetValue(Json.PropertyName<Map>(nameof(Map.Provider)), 
									StringComparison.InvariantCultureIgnoreCase).ToObject(instance.GetType());
								break;
							}
							field = field.Next as JProperty;
						}
					}
				}
			}
			else
			{
				var provider = item.GetValue(Json.PropertyName<Map>(nameof(model.Provider)), StringComparison.InvariantCultureIgnoreCase);
				if (provider != null)
				{
					var field = provider.First as JProperty;
					while (field != null)
					{
						if (String.Equals(field.Name, nameof(IProvider.Id), StringComparison.InvariantCultureIgnoreCase))
						{
							var instance = ProviderBase.GetInstance<IProvider>(field.Value.ToObject<string>());
							model.Provider = (IProvider)item.GetValue(Json.PropertyName<Map>(nameof(Map.Provider)),
								StringComparison.InvariantCultureIgnoreCase).ToObject(instance.GetType());
							break;
						}
						field = field.Next as JProperty;
					}
				}
				var icon = item.GetValue(Json.PropertyName<Map>(nameof(Map.Icon)), StringComparison.InvariantCultureIgnoreCase);
				if (icon != null)
				{
					model.Icon = icon.ToObject<Icon>();
				}
			}

			var position = item.GetValue(Json.PropertyName<Map>(nameof(Map.Position)), StringComparison.InvariantCultureIgnoreCase);
			if (position != null)
			{
				var field = position.First as JProperty;
				while (field != null)
				{
					if (String.Equals(field.Name, Json.PropertyName<IPosition>(nameof(IPosition.Id)), StringComparison.InvariantCultureIgnoreCase))
					{
						model.Position = PositionBase.GetInstance<IPosition>(field.Value.ToObject<string>());
						break;
					}
					field = field.Next as JProperty;
				}
				field = position.First as JProperty;
				while (field != null)
				{
					if (String.Equals(field.Name, Json.PropertyName<IPosition>(nameof(PositionBase._internalDatum)), StringComparison.InvariantCultureIgnoreCase))
					{
						model.Position.TryParse(field.Value.ToObject<string>());
						break;
					}
					field = field.Next as JProperty;
				}
			}

			var label = item.GetValue(Json.PropertyName<Map>(nameof(Map.Label)), StringComparison.InvariantCultureIgnoreCase);
			if (label != null)
			{
				var field = label.First as JProperty;
				while (field != null)
				{
					if (String.Equals(field.Name, Json.PropertyName<ILabel>(nameof(ILabel.Id)), StringComparison.InvariantCultureIgnoreCase))
					{
						var instance = LabelBase.GetInstance<ILabel>(field.Value.ToObject<string>());
						model.Label = (ILabel) item.GetValue(Json.PropertyName<Map>(nameof(Map.Label)), 
							StringComparison.InvariantCultureIgnoreCase).ToObject(instance.GetType());
						break;
					}
					field = field.Next as JProperty;
				}
			}

			return model;
		}

		public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
		{
			var model = value as Map;
			writer.WriteStartObject();

			writer.WritePropertyName(Json.PropertyName<Map>(nameof(Map.Zoom)));
			writer.WriteValue(model.Zoom);

			writer.WritePropertyName(Json.PropertyName<Map>(nameof(Map.SearchText)));
			writer.WriteValue(model.SearchText);

			writer.WritePropertyName(Json.PropertyName<Map>(nameof(Map.Address)));
			writer.WriteStartObject();
			writer.WriteValue(model.Address);
			writer.WriteEndObject();

			writer.WritePropertyName(Json.PropertyName<Map>(nameof(Map.Position)));
			writer.WriteStartObject();

			writer.WritePropertyName(Json.PropertyName<IPosition>(nameof(IPosition.Id)));
			writer.WriteValue(model.Position.Id);

			writer.WritePropertyName(Json.PropertyName<PositionBase>(nameof(PositionBase._internalDatum)));
			writer.WriteValue(model.Position.ToString());
			writer.WriteEndObject();

			writer.WriteEndObject();
		}
	}
}
	