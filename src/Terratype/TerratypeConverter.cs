using Newtonsoft.Json.Linq;
using System;
using System.Linq;
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

		private void MergeJson(JObject data, JObject config, string fieldName)
		{
            data.Merge(new JObject(new JProperty(Json.PropertyName<Models.Model>(fieldName), 
                config.GetValue(Json.PropertyName<Models.Model>(fieldName), StringComparison.InvariantCultureIgnoreCase))));
		}

        public object ConvertDataToSource(PublishedPropertyType propertyType, object source, bool preview)
        {
            var values = ApplicationContext.Current.Services.DataTypeService.GetPreValuesByDataTypeId(propertyType.DataTypeId);
            var config = JObject.Parse(values.First());

            JObject data = null;
            if (source is string && !string.IsNullOrWhiteSpace((string) source))
            {
                data = JObject.Parse((string)source);
            }
            else
            {
                data = new JObject();
				//MergeJson(data, config, nameof(Models.Model.Lookup));
				MergeJson(data, config, nameof(Models.Model.Zoom));
				MergeJson(data, config, nameof(Models.Model.Position));
            }
            var innerConfig = config.GetValue("config") as JObject;
			MergeJson(data, innerConfig, nameof(Models.Model.Icon));
			MergeJson(data, innerConfig, nameof(Models.Model.Provider));
			MergeJson(data, innerConfig, nameof(Models.Model.Height));
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

