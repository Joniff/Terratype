using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;

namespace Terratype.Models
{
    public class ConfigIcon : Icon
    {
        public string Name {get; set;}
        public ConfigIcon()
        {
        }

        public ConfigIcon(ConfigIcon other)
        {
            Name = other.Name;
            Image = other.Image;
            ShadowImage = other.ShadowImage;
            Size = other.Size;
            Anchor = other.Anchor;
        }

        public ConfigIcon(string value)
        {
            var other = Newtonsoft.Json.JsonConvert.DeserializeObject<ConfigIcon>(value);
            
            Name = other.Name;
            Image = other.Image;
            ShadowImage = other.ShadowImage;
            Size = other.Size;
            Anchor = other.Anchor;
        }

        public static implicit operator ConfigIcon(string value)
        {
            return Newtonsoft.Json.JsonConvert.DeserializeObject<ConfigIcon>(value);
        }

        public static implicit operator string(ConfigIcon icon)
        {
            var settings = new JsonSerializerSettings();
            settings.ContractResolver = new LowercaseContractResolver();
            return Newtonsoft.Json.JsonConvert.SerializeObject(icon, Newtonsoft.Json.Formatting.None, settings);
        }    
        
        public override string ToString()
        {
            var settings = new JsonSerializerSettings();
            settings.ContractResolver = new LowercaseContractResolver();
            return Newtonsoft.Json.JsonConvert.SerializeObject(this, Newtonsoft.Json.Formatting.None, settings);
        }

    }
}

public class LowercaseContractResolver : DefaultContractResolver
{
    protected override string ResolvePropertyName(string propertyName)
    {
        return Char.ToLowerInvariant(propertyName[0]) + propertyName.Substring(1);
    }
}