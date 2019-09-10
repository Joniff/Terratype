using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Newtonsoft.Json;

namespace Terratype
{
	public static class Json
	{
		public static string PropertyName<T>(string name)
		{
			var process = new Stack<Type>();

			process.Push(typeof(T));

			do
			{
				var current = process.Pop();
				var prop = current.GetProperty(name, System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public | System.Reflection.BindingFlags.NonPublic);
				if (prop != null)
				{
					var attributes = prop.GetCustomAttributes(typeof(JsonPropertyAttribute), true);
					if (attributes != null)
					{
						var attribute = attributes.First() as JsonPropertyAttribute;
						if (attribute != null)
						{
							return attribute.PropertyName;
						}
					}
				}

				if (current.BaseType != null)
				{
					process.Push(current.BaseType);
				}

				foreach (var inter in current.GetInterfaces())
				{
					process.Push(inter);
				}
			}
			while (process.Any());
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
