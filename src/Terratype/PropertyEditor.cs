using ClientDependency.Core;
using System.Collections.Generic;
using Umbraco.Core.PropertyEditors;
using Umbraco.Web.PropertyEditors;

namespace Terratype
{
    [PropertyEditor("Terratype", "Terratype", "/App_Plugins/Terratype/1.0.0/views/editor.html", ValueType = PropertyEditorValueTypes.Text, Group = "Map", Icon = "icon-map-location")]
	[PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/Terratype/1.0.0/scripts/terratype.js")]
    public class TerratypePropertyEditor : PropertyEditor
	{
		protected override PreValueEditor CreatePreValueEditor()
		{
			return new TerratypePreValueEditor();
		}

		public TerratypePropertyEditor()
		{
            _defaultPreVals = new Dictionary<string, object>
            {
                { "definition", "{ \"config\": {\"height\": 400, \"debug\": 0, \"icon\": {\"id\":\"redmarker\"}}}" }
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
			[PreValueField("definition", "Config", "/App_Plugins/Terratype/1.0.0/views/config.html", Description = "", HideLabel = true)]
            public Models.Model Definition { get; set; }

        }
	}
}
