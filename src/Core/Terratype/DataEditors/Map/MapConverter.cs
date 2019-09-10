using System;
using Newtonsoft.Json.Linq;
using Umbraco.Core.Models.PublishedContent;
using Umbraco.Core.PropertyEditors;
using Umbraco.Core.Services;

namespace Terratype.DataEditors.Map
{
	// To use in a Razor template, where Map is the name of the Terratype property
	//
	//  CurrentPage.Map.Position.ToString()
	//  CurrentPage.Map.Zoom;

	public class MapConverter : PropertyValueConverterBase
	{
		IDataTypeService DataTypeService;

		public MapConverter(IDataTypeService dataTypeService)
		{
			DataTypeService = dataTypeService;
		}

		public override bool IsConverter(IPublishedPropertyType propertyType) => propertyType.EditorAlias == MapDataEditor.DataEditorAlias;
		public override PropertyCacheLevel GetPropertyCacheLevel(IPublishedPropertyType propertyType) => PropertyCacheLevel.Element;

		public override Type GetPropertyValueType(IPublishedPropertyType propertyType) => typeof(Terratype.Models.Map);

		private void MergeJson(JObject data, JObject config, string fieldName) => 
			data.Merge(new JObject(new JProperty(Json.PropertyName<Models.Map>(fieldName), config.GetValue(Json.PropertyName<Models.Map>(fieldName), StringComparison.InvariantCultureIgnoreCase))));

		public object ConvertDataToSource(PublishedPropertyType propertyType, object source, bool preview)
		{
			var values = DataTypeService.GetDataType(propertyType.EditorAlias);
			var config = JObject.Parse((string) values.Configuration);

			JObject data = null;
			if (source is string && !string.IsNullOrWhiteSpace((string) source))
			{
				data = JObject.Parse((string)source);
			}
			else
			{
				data = new JObject();
				//MergeJson(data, config, nameof(Models.Map.Lookup));
				MergeJson(data, config, nameof(Models.Map.Zoom));
				MergeJson(data, config, nameof(Models.Map.Position));
			}
			var innerConfig = config.GetValue("config") as JObject;
			MergeJson(data, innerConfig, nameof(Models.Map.Icon));
			MergeJson(data, innerConfig, nameof(Models.Map.Provider));
			MergeJson(data, innerConfig, nameof(Models.Map.Height));
			return new Models.Map(data);
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

