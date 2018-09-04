using System;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace Terratype
{
	public static class Json
    {
        public static string PropertyName<T>(string name)
        {
            var attr = typeof(T).GetProperty(name, System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic).
                GetCustomAttributes(typeof(JsonPropertyAttribute), true).First() as JsonPropertyAttribute;
            if (attr != null && !String.IsNullOrWhiteSpace(attr.PropertyName))
            {
                return attr.PropertyName;
            }
            return name.ToLowerInvariant();
        }
    }
    public class IHtmlStringConverter : JsonConverter
    {
        public override bool CanConvert(Type objectType)
        {
            return typeof(IHtmlString).IsAssignableFrom(objectType);
        }

        public override void WriteJson(Newtonsoft.Json.JsonWriter writer, object value, Newtonsoft.Json.JsonSerializer serializer)
        {
            IHtmlString source = value as IHtmlString;
            if (source == null)
            {
                return;
            }

            writer.WriteValue(source.ToString());
        }

        public override object ReadJson(Newtonsoft.Json.JsonReader reader, Type objectType, object existingValue, Newtonsoft.Json.JsonSerializer serializer)
        {
            // warning, not thoroughly tested
            var html = reader.Value as string;
            return html == null ? null : System.Web.Mvc.MvcHtmlString.Create(html);
        }
    }
}
