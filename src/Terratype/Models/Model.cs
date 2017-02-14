using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics;
using System.Web;

namespace Terratype.Models
{
    [DebuggerDisplay("{Position},{Zoom}")]
    [JsonObject(MemberSerialization.OptIn)]
    [JsonConverter(typeof(ModelConvertor))]
    public class Model
    {
        /// <summary>
        /// Which provider is this map using to render
        /// </summary>
        [JsonProperty(PropertyName = "provider")]
        public Provider Provider { get; internal set; }

        /// <summary>
        /// Where is this map pointing to
        /// </summary>
        [JsonProperty(PropertyName = "position")]
        public Position Position { get; set; }

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
        [JsonProperty(PropertyName = "lookup")]
        public string Lookup { get; set; }

        /// <summary>
        /// Label
        /// </summary>
        [JsonProperty(PropertyName = "label")]
        public Label Label { get; set; }

        public Model()
        {

        }

        public Model(Model other)
        {
            Provider = other.Provider;
            Position = other.Position;
            Zoom = other.Zoom;
            Lookup = other.Lookup;
            Icon = other.Icon;
            Label = other.Label;
        }

        public Model(string json) : this(JsonConvert.DeserializeObject<Model>(json))
        {
        }

        public Model(JObject data) : this(data.ToObject<Model>())
        {
        }
    }

    [DebuggerDisplay("{Position},{Zoom}")]
    [JsonObject(MemberSerialization.OptIn)]
    public class Model<TProvider, TPosition, TLabel>
        where TProvider : Models.Provider
        where TPosition : Models.Position
        where TLabel : Models.Label
    {
        /// <summary>
        /// Which provider is this map using to render
        /// </summary>
        [JsonProperty(PropertyName = "provider")]
        public TProvider Provider { get; internal set; }

        /// <summary>
        /// Where is this map point to
        /// </summary>
        [JsonProperty(PropertyName = "position")]
        public TPosition Position { get; set; }

        /// <summary>
        /// Which provider is this map using to render
        /// </summary>
        [JsonProperty(PropertyName = "icon")]
        public Icon Icon { get; internal set; }

        [JsonProperty(PropertyName = "zoom")]
        public int Zoom { get; set; }

        [JsonProperty(PropertyName = "lookup")]
        public string Lookup { get; set; }

        [JsonProperty(PropertyName = "label")]
        public TLabel Label { get; set; }

        public Model()
        {

        }

        public Model(Model other)
        {
            Provider = other.Provider as TProvider;
            Position = other.Position as TPosition;
            Icon = other.Icon;
            Zoom = other.Zoom;
            Lookup = other.Lookup;
            Label = other.Label as TLabel;
        }
        public Model(string json) : this(JsonConvert.DeserializeObject<Model>(json))
        { 
        }

        public Model(JObject data) : this(data.ToObject<Model>())
        {
        }
    }

    public class ModelConvertor : JsonConverter
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
            return typeof(Model).IsAssignableFrom(objectType);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var model = new Model();

            JObject item = JObject.Load(reader);
            model.Lookup = item.GetValue(Json.PropertyName<Model>(nameof(Model.Lookup)), StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
            model.Zoom = item.GetValue(Json.PropertyName<Model>(nameof(Model.Zoom)), StringComparison.InvariantCultureIgnoreCase)?.Value<int>() ?? 0;
            model.Icon = new Models.Icon(item.GetValue(Json.PropertyName<Model>(nameof(Model.Icon)), StringComparison.InvariantCultureIgnoreCase).ToObject<Models.Icon>());

            var provider = item.GetValue(Json.PropertyName<Model>(nameof(Model.Provider)), StringComparison.InvariantCultureIgnoreCase);
            if (provider != null)
            {
                var field = provider.First as JProperty;
                while (field != null)
                {
                    if (String.Equals(field.Name, nameof(Provider.Id), StringComparison.InvariantCultureIgnoreCase))
                    {
                        System.Type providerType = Provider.Providers[field.Value.ToObject<string>()];
                        model.Provider = (Provider)item.GetValue(Json.PropertyName<Model>(nameof(Model.Provider)), StringComparison.InvariantCultureIgnoreCase).ToObject(providerType);
                        break;
                    }
                    field = field.Next as JProperty;
                }
            }

            var position = item.GetValue(Json.PropertyName<Model>(nameof(Model.Position)), StringComparison.InvariantCultureIgnoreCase);
            if (position != null)
            {
                var field = position.First as JProperty;
                while (field != null)
                {
                    if (String.Equals(field.Name, Json.PropertyName<Position>(nameof(Position.Id)), StringComparison.InvariantCultureIgnoreCase))
                    {
                        System.Type positionType = Position.Register[field.Value.ToObject<string>()];
                        model.Position = Models.Position.Create(positionType);
                        break;
                    }
                    field = field.Next as JProperty;
                }
                field = position.First as JProperty;
                while (field != null)
                {
                    if (String.Equals(field.Name, Json.PropertyName<Position>(nameof(Position._datum)), StringComparison.InvariantCultureIgnoreCase))
                    {
                        model.Position.TryParse(field.Value.ToObject<string>());
                        break;
                    }
                    field = field.Next as JProperty;
                }
            }

            var label = item.GetValue(Json.PropertyName<Model>(nameof(Model.Label)), StringComparison.InvariantCultureIgnoreCase);
            if (label != null)
            {
                var field = label.First as JProperty;
                while (field != null)
                {
                    if (String.Equals(field.Name, Json.PropertyName<Label>(nameof(Label.Id)), StringComparison.InvariantCultureIgnoreCase))
                    {
                        System.Type labelType = Label.Register[field.Value.ToObject<string>()];
                        model.Label = (Label)item.GetValue(Json.PropertyName<Model>(nameof(Model.Label)), StringComparison.InvariantCultureIgnoreCase).ToObject(labelType);
                        break;
                    }
                    field = field.Next as JProperty;
                }
            }

            return model;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            var model = value as Model;
            writer.WriteStartObject();

            writer.WritePropertyName(Json.PropertyName<Model>(nameof(Model.Zoom)));
            writer.WriteValue(model.Zoom);

            writer.WritePropertyName(Json.PropertyName<Model>(nameof(Model.Lookup)));
            writer.WriteValue(model.Lookup);

            writer.WritePropertyName(Json.PropertyName<Model>(nameof(Model.Position)));
            writer.WriteStartObject();
            writer.WritePropertyName(Json.PropertyName<Position>(nameof(Position.Id)));
            writer.WriteValue(model.Position.Id);
            writer.WritePropertyName(Json.PropertyName<Position>(nameof(Position._datum)));
            writer.WriteValue(model.Position.ToString());
            writer.WriteEndObject();

            writer.WriteEndObject();
        }
    }
}
    