using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.PropertyEditors;
/*
namespace Terratype
{
    // To use in a Razor template, where Map is the name of the AGM property
    //
    //  CurrentPage.Map.Latitude;
    //  CurrentPage.Map.Longitude;
    //  CurrentPage.Map.Zoom;

    [PropertyValueType(typeof(Model))]
    [PropertyValueCache(PropertyCacheValue.All, PropertyCacheLevel.Content)]
    public class TerratypeConverter : IPropertyValueConverter
    {
        public bool IsConverter(PublishedPropertyType propertyType)
        {
            return propertyType.PropertyEditorAlias == "Terratype";
        }

        public object ConvertDataToSource(PublishedPropertyType propertyType, object source, bool preview)
        {
            return ConvertSource(source);
        }

        public object ConvertSourceToObject(PublishedPropertyType propertyType, object source, bool preview)
        {
            return source;
        }

        public object ConvertSourceToXPath(PublishedPropertyType propertyType, object source, bool preview)
        {
            return null;
        }

        private static Model ConvertSource(object source)
        {
            if (source == null || !(source is string))
            {
                return new Model();
            }
            return new Model((string)source);
        }
    }
}


*/