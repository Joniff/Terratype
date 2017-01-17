using ClientDependency.Core;
using System;
using System.Collections.Generic;
using Umbraco.Core.PropertyEditors;
using Umbraco.Web.PropertyEditors;

namespace Terratype
{
	[PropertyEditor("Terratype", "Terratype", "/App_Plugins/Terratype/1.0.0/views/content.html", ValueType = "TEXT")]
	[PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/Terratype/1.0.0/scripts/terratype.js")]
	[PropertyEditorAsset(ClientDependencyType.Css, "/App_Plugins/Terratype/1.0.0/css/content.css")]
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
    //            { "definition", "{\"apiKey\":\"\", \"coordinateSystem\":\"WGS-84\", \"search\":{\"status\":\"hide\",\"limit\":{\"country\":\"\"}}}" },
    //            { "defaultLocation", "55.4063207,10.3870147,17" },
    //            { "height", 400 },
				//{ "coordinatesBehavour", (int) CoordinatesBehavour.Edit },
				//{ "icon", "{\"image\":\"https://mt.google.com/vt/icon/name=icons/spotlight/spotlight-poi.png\"}" },
    //            { "format", (int) Models.Format.Csv },
    //            { "reduceWatches", false }
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
            public Model Definition { get; set; }

        }
	}
}
