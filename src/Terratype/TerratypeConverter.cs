using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.PropertyEditors;

namespace Terratype
{
    // To use in a Razor template, where Map is the name of the Terratype property
    //
    //  CurrentPage.Map.Position.ToString()
    //  CurrentPage.Map.Zoom;

    [PropertyValueType(typeof(Models.Model))]
    [PropertyValueCache(PropertyCacheValue.All, PropertyCacheLevel.Content)]
    public class TerratypeConverter : IPropertyValueConverter
    {
        public bool IsConverter(PublishedPropertyType propertyType)
        {
            return propertyType.PropertyEditorAlias == "Terratype";
        }

        public object ConvertDataToSource(PublishedPropertyType propertyType, object source, bool preview)
        {
            var values = ApplicationContext.Current.Services.DataTypeService.GetPreValuesByDataTypeId(propertyType.DataTypeId);
            var config = JObject.Parse(values.First());

            JObject data = null;
            if (source != null && source is string)
            {
                data = JObject.Parse((string)source);
            }
            else
            {
                data = new JObject();
                data.Merge(config.GetValue(nameof(Models.Model.Lookup), StringComparison.InvariantCultureIgnoreCase));
                data.Merge(config.GetValue(nameof(Models.Model.Zoom), StringComparison.InvariantCultureIgnoreCase));
            }
            var innerConfig = config.GetValue("config") as JObject;
            data.Merge(new JObject(new JProperty(nameof(Models.Model.Icon).ToLowerInvariant(), innerConfig.GetValue(nameof(Models.Model.Icon), StringComparison.InvariantCultureIgnoreCase))));
            data.Merge(new JObject(new JProperty(nameof(Models.Model.Provider).ToLowerInvariant(), innerConfig.GetValue(nameof(Models.Model.Provider), StringComparison.InvariantCultureIgnoreCase))));
            return new Models.Model(data);
        }

        public object ConvertSourceToObject(PublishedPropertyType propertyType, object source, bool preview)
        {
            return source;
        }

        public object ConvertSourceToXPath(PublishedPropertyType propertyType, object source, bool preview)
        {
            return null;
        }
    }
}

