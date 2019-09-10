using System;
using System.Diagnostics;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Terratype.Icons
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn)]
	public class Icon
	{
		/// <summary>
		/// Predefined identifier for this icon, or null for custom icon
		/// </summary>
		[JsonProperty(PropertyName = "id")]
		public string Id { get; set; }

		[JsonProperty(PropertyName = "url")]
		public Uri Url { get; set; }

		[JsonObject(MemberSerialization.OptIn)]
		[DebuggerDisplay("{Width}W x {Height}H")]
		//[JsonConverter(typeof(SizeConverter))]
		public class SizeDefinition
		{
			[JsonProperty(PropertyName = "width")]
			public int Width { get; set; }

			[JsonProperty(PropertyName = "height")]
			public int Height { get; set; }
		}

		[JsonProperty(PropertyName = "size")]
		public SizeDefinition Size { get; set; }

		[DebuggerDisplay("{Horizontal} {Vertical}")]
		[JsonObject(MemberSerialization.OptIn)]
		[JsonConverter(typeof(AnchorDefinitionConverter))]
		public class AnchorDefinition
		{
			[JsonProperty(PropertyName = "horizontal")]
			public AnchorHorizontal Horizontal { get; set; }

			[JsonProperty(PropertyName = "vertical")]
			public AnchorVertical Vertical { get; set; }

			public AnchorDefinition()
			{
				Horizontal = AnchorHorizontal.Style.Center;
				Vertical = AnchorVertical.Style.Bottom;
			}
		}

		[JsonProperty(PropertyName = "anchor")]
		public AnchorDefinition Anchor { get; set; }

		public Icon()
		{
		}

		public Icon(Icon other)
		{
			Id = other.Id;
			Url = other.Url;
			Size = other.Size;
			Anchor = other.Anchor;
		}
	}

	public class AnchorDefinitionConverter : JsonConverter
	{
		public override bool CanConvert(Type objectType)
		{
			return typeof(Icon.AnchorDefinition).IsAssignableFrom(objectType);
		}

		public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
		{
			var anchor = new Icon.AnchorDefinition();
			JObject item = JObject.Load(reader);
			anchor.Horizontal = new AnchorHorizontal(item.GetValue(Json.PropertyName<Icon.AnchorDefinition>(nameof(Icon.AnchorDefinition.Horizontal)))?.Value<string>());
			anchor.Vertical = new AnchorVertical(item.GetValue(Json.PropertyName<Icon.AnchorDefinition>(nameof(Icon.AnchorDefinition.Vertical)))?.Value<string>());
			return anchor;
		}

		public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
		{
			var anchor = value as Icon.AnchorDefinition;
			writer.WriteStartObject();

			writer.WritePropertyName(Json.PropertyName<Icon.AnchorDefinition>(nameof(Icon.AnchorDefinition.Horizontal)));
			writer.WriteValue(anchor.Horizontal.IsManual() ? anchor.Horizontal.Manual.ToString() : anchor.Horizontal.Automatic.ToString().ToLowerInvariant());

			writer.WritePropertyName(Json.PropertyName<Icon.AnchorDefinition>(nameof(Icon.AnchorDefinition.Vertical)));
			writer.WriteValue(anchor.Vertical.IsManual() ? anchor.Vertical.Manual.ToString() : anchor.Vertical.Automatic.ToString().ToLowerInvariant());

			writer.WriteEndObject();
		}
	}

	//public class SizeConverter : JsonConverter
	//{
	//    public override bool CanConvert(Type objectType)
	//    {
	//        return typeof(Icon.SizeDefinition).IsAssignableFrom(objectType);
	//    }

	//    public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
	//    {
	//        var size = new Icon.SizeDefinition();
	//        JObject item = JObject.Load(reader);
	//        size.Height = new AnchorHorizontal(item.GetValue(Json.PropertyName<Models.Icon.SizeDefinition>(nameof(Models.Icon.SizeDefinition.Height)))?.Value<string>());
	//        size.Width = new AnchorVertical(item.GetValue(Json.PropertyName<Models.Icon.SizeDefinition>(nameof(Models.Icon.SizeDefinition.Width)))?.Value<string>());
	//        return size;
	//    }

	//    public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
	//    {
	//        var size = value as Icon.SizeDefinition;
	//        writer.WriteStartObject();

	//        writer.WritePropertyName(Json.PropertyName<Models.Icon.SizeDefinition>(nameof(Models.Icon.SizeDefinition.Height)));
	//        writer.WriteValue(size.Height);

	//        writer.WritePropertyName(Json.PropertyName<Models.Icon.SizeDefinition>(nameof(Models.Icon.SizeDefinition.Width)));
	//        writer.WriteValue(size.Width);

	//        writer.WriteEndObject();
	//    }
	//}
}
