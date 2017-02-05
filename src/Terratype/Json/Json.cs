using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

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
}
