using ClientDependency.Core;
using Umbraco.Core.Logging;
using Umbraco.Core.PropertyEditors;
using Umbraco.Web.PropertyEditors;

namespace Terratype.DataEditors.Map
{
	[DataEditor(MapDataEditor.DataEditorAlias, EditorType.PropertyValue, MapDataEditor.DataEditorAlias, "/App_Plugins/Terratype/views/editor.html?cache=2.0.0", ValueType = ValueTypes.Json, Group = "Map", Icon = "icon-map-location")]
#if DEBUG
	[PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/Terratype/scripts/terratype.js?cache=2.0.0")]
#else
	[PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/Terratype/scripts/terratype.min.js?cache=2.0.0")]
#endif
	public class MapDataEditor : DataEditor
	{
		public const string DataEditorAlias = nameof(Terratype);

		public MapDataEditor(ILogger logger) : base(logger)
		{
		}


		protected override IConfigurationEditor CreateConfigurationEditor() => new MapConfigurationEditor();

		protected override IDataValueEditor CreateValueEditor() => new MapDataValueEditor(Attribute);
	}
}
