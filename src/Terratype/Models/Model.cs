using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics;
using System.Web;
using System.Web.Mvc;

namespace Terratype.Models
{
    [DebuggerDisplay("{Position},{Zoom}")]
    [JsonObject(MemberSerialization.OptIn)]
    public class Model
    {
        /// <summary>
        /// Which provider is this map using to render
        /// </summary>
        [JsonProperty]
        public Provider Provider { get; set; }

        /// <summary>
        /// Where is this map point to
        /// </summary>
        [JsonProperty]
        public Position Position { get; set; }

        /// <summary>
        /// Which provider is this map using to render
        /// </summary>
        [JsonProperty]
        public Icon Icon { get; set; }

        [JsonProperty]
        public int Zoom { get; set; }

        [JsonProperty]
        public string Lookup { get; set; }

        public Model()
        {

        }

        public Model(Model other)
        {
            Provider = other.Provider;
            Position = other.Position;
            Zoom = other.Zoom;
            Lookup = other.Lookup;
        }

        public Model(string json) : this(JsonConvert.DeserializeObject<Model>(json, new ModelConvertor()))
        {
        }

        public Model(JObject data) : this(data.ToObject<Model>(new JsonSerializer() { Converters = { new ModelConvertor() } }))
        {        
        }

        public IHtmlString GetHtml(int height = 400, string language = null)
        {
            if (Provider == null)
            {
                throw new ArgumentNullException(nameof(Provider));
            }

            return Provider.GetHtml(this, height, language);
        }
    }

    [DebuggerDisplay("{Position},{Zoom}")]
    [JsonObject(MemberSerialization.OptIn)]
    public class Model<TProvider, TPosition> 
        where TProvider : Models.Provider 
        where TPosition : Models.Position
    {
        /// <summary>
        /// Which provider is this map using to render
        /// </summary>
        [JsonProperty]
        public TProvider Provider { get; set; }

        /// <summary>
        /// Where is this map point to
        /// </summary>
        [JsonProperty]
        public TPosition Position { get; set; }

        /// <summary>
        /// Which provider is this map using to render
        /// </summary>
        [JsonProperty]
        public Icon Icon { get; set; }

        [JsonProperty]
        public int Zoom { get; set; }

        [JsonProperty]
        public string Lookup { get; set; }

        public Model()
        {

        }

        public Model(Model other)
        {
            Provider = other.Provider as TProvider;
            Position = other.Position as TPosition;
            Zoom = other.Zoom;
            Lookup = other.Lookup;
        }

        public Model(string json) : this(JsonConvert.DeserializeObject<Model>(json, new ModelConvertor()))
        {
        }

        public Model(JObject data) : this(data.ToObject<Model>(new JsonSerializer() { Converters = { new ModelConvertor() } }))
        {
        }

    }




    public class ModelConvertor : JsonConverter
    {
        public override bool CanWrite { get { return false; } }

        public override bool CanConvert(Type objectType)
        {
            return typeof(Model).IsAssignableFrom(objectType);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var model = new Model();

            JObject item = JObject.Load(reader);
            model.Lookup = item.GetValue(nameof(Model.Lookup), StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
            model.Zoom = item.GetValue(nameof(Model.Zoom), StringComparison.InvariantCultureIgnoreCase)?.Value<int>() ?? 0;
            model.Icon = new Models.Icon(item.GetValue(nameof(Model.Icon), StringComparison.InvariantCultureIgnoreCase) as JObject);

            var provider = item.GetValue(nameof(Provider), StringComparison.InvariantCultureIgnoreCase);
            if (provider != null)
            {
                var field = provider.First as JProperty;
                while (field != null)
                {
                    if (String.Equals(field.Name, nameof(Provider.Id), StringComparison.InvariantCultureIgnoreCase))
                    {
                        System.Type providerType = Provider.Providers[field.Value.ToObject<string>()];
                        model.Provider = (Provider)item.GetValue(nameof(Provider), StringComparison.InvariantCultureIgnoreCase).ToObject(providerType);
                        break;
                    }
                    field = field.Next as JProperty;
                }
            }

            var position = item.GetValue(nameof(Position), StringComparison.InvariantCultureIgnoreCase);
            if (position != null)
            {
                var field = position.First as JProperty;
                while (field != null)
                {
                    if (String.Equals(field.Name, nameof(Position.Id), StringComparison.InvariantCultureIgnoreCase))
                    {
                        System.Type positionType = Position.Register[field.Value.ToObject<string>()];
                        model.Position = Models.Position.Create(field.Value.ToObject<string>());
                        break;
                    }
                    field = field.Next as JProperty;
                }
                field = position.First as JProperty;
                while (field != null)
                {
                    if (String.Equals(field.Name, nameof(Position.datum), StringComparison.InvariantCultureIgnoreCase))
                    {
                        model.Position.TryParse(field.Value as JObject);
                        break;
                    }
                    field = field.Next as JProperty;
                }
            }
            return model;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }
    }

}
