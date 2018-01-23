using ClientDependency.Core;
using System.Collections.Generic;
using Umbraco.Core.PropertyEditors;
using Umbraco.Web.PropertyEditors;

namespace Terratype
{
    [PropertyEditor(TerratypePropertyEditor.PropertyEditorAlias, TerratypePropertyEditor.PropertyEditorAlias, "/App_Plugins/Terratype/views/editor.html?cache=1.0.16", ValueType = PropertyEditorValueTypes.Text, Group = "Map", Icon = "icon-map-location")]
	[PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/Terratype/scripts/terratype.js?cache=1.0.16")]
    public class TerratypePropertyEditor : PropertyEditor
	{
		public const string PropertyEditorAlias = nameof(Terratype);

		protected override PreValueEditor CreatePreValueEditor()
		{
			return new TerratypePreValueEditor();
		}

		public TerratypePropertyEditor()
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
			[PreValueField("definition", "Config", "/App_Plugins/Terratype/views/config.html?cache=1.0.16", Description = "", HideLabel = true)]
            public Models.Model Definition { get; set; }

        }
	}
}
