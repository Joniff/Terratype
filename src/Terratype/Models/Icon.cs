using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Diagnostics;

namespace Terratype.Models
{
    [DebuggerDisplay("{Id}")]
    [JsonObject(MemberSerialization.OptIn)]
    public class Icon
    {
        /// <summary>
        /// Predefined identifier for this icon, or null for custom icon
        /// </summary>
        [JsonProperty]
        public string Id { get; set; }

        [JsonProperty]
        public Uri Url { get; set; }

        [DebuggerDisplay("{Width}W x {Height}H")]
        public class SizeDefinition
        {
            public int Width { get; set; }
            public int Height { get; set; }
        }

        [JsonProperty]

        public SizeDefinition Size { get; set; }

        [DebuggerDisplay("{Horizontal} {Vertical}")]
        public class AnchorDefinition
        {
            public AnchorHorizontal Horizontal { get; set; }

            public AnchorVertical Vertical { get; set; }

            public AnchorDefinition()
            {
                Horizontal = Terratype.Models.AnchorHorizontal.Style.Center;
                Vertical = Terratype.Models.AnchorVertical.Style.Bottom;
            }
        }

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

        public Icon(string json) : this(JsonConvert.DeserializeObject<Icon>(json, new IconConvertor()))
        {
        }

        public Icon(JObject data) : this(data.ToObject<Icon>(new JsonSerializer() { Converters = { new IconConvertor() } }))
        {
        }
    }

    public class IconConvertor : JsonConverter
    {
        public override bool CanWrite { get { return false; } }

        public override bool CanConvert(Type objectType)
        {
            return typeof(Icon).IsAssignableFrom(objectType);
        }

        public override object ReadJson(JsonReader reader, Type objectType, object existingValue, JsonSerializer serializer)
        {
            var icon = new Icon();

            JObject item = JObject.Load(reader);
            icon.Id = item.GetValue(nameof(Icon.Id), StringComparison.InvariantCultureIgnoreCase)?.Value<string>();
            icon.Url = new Uri(item.GetValue(nameof(Icon.Url), StringComparison.InvariantCultureIgnoreCase)?.Value<string>());
            icon.Size = item.GetValue(nameof(Icon.Size), StringComparison.InvariantCultureIgnoreCase)?.ToObject<Icon.SizeDefinition>();
            var anchor = item.GetValue(nameof(Icon.Anchor), StringComparison.InvariantCultureIgnoreCase);
            if (anchor != null)
            {
                icon.Anchor = new Icon.AnchorDefinition();
                var field = anchor.First as JProperty;
                int counter = 0;
                while (field != null && counter != 2)
                {
                    if (String.Equals(field.Name, nameof(Icon.AnchorDefinition.Horizontal), StringComparison.InvariantCultureIgnoreCase))
                    {
                        icon.Anchor.Horizontal = new AnchorHorizontal(field.Value.ToObject<string>());
                        counter++;
                    }
                    else if (String.Equals(field.Name, nameof(Icon.AnchorDefinition.Vertical), StringComparison.InvariantCultureIgnoreCase))
                    {
                        icon.Anchor.Vertical = new AnchorVertical(field.Value.ToObject<string>());
                        counter++;
                    }
                    field = field.Next as JProperty;
                }
            }
            return icon;
        }

        public override void WriteJson(JsonWriter writer, object value, JsonSerializer serializer)
        {
            throw new NotImplementedException();
        }
    }



}
