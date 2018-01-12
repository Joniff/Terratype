using System.Collections.Generic;
using ClientDependency.Core;
using Umbraco.Core.PropertyEditors;
using Umbraco.Web.PropertyEditors;

namespace Terratype.ListView
{
	[PropertyEditor(nameof(Terratype), nameof(Terratype), "/App_Plugins/Terratype.ListView/views/editor.html?cache=1.0.15", ValueType = PropertyEditorValueTypes.Text, Group = "Map", Icon = "icon-map-location")]
	[PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/Terratype.ListView/scripts/terratype.listview.js?cache=1.0.15")]
    public class TerratypeListViewPropertyEditor : PropertyEditor
	{
		protected override PreValueEditor CreatePreValueEditor()
		{
			return new TerratypePreValueEditor();
		}

		public TerratypeListViewPropertyEditor()
		{
            _defaultPreVals = new Dictionary<string, object>
            {
                { "definition", "{ \"config\": {\"height\": 400, \"gridHeight\": 400, \"debug\": 0, \"icon\": {\"id\":\"redmarker\"}, \"label\": {\"enable\": false, \"editPosition\":\"0\", \"id\": \"standard\"}}}" }
            };
		}

        private IDictionary<string, object> _defaultPreVals;
		public override IDictionary<string, object> DefaultPreValues
		{
			get { return _defaultPreVals; }
			set { _defaultPreVals = value; }
		}

		internal class TerratypePreValueEditor : PreValueEditor
		{
			[PreValueField("definition", "Config", "/App_Plugins/Terratype.ListView/views/config.html?cache=1.0.15", Description = "", HideLabel = true)]
            public Models.Model Definition { get; set; }

        }
	}
}
