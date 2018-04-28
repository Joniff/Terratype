﻿using System.Collections.Generic;
using ClientDependency.Core;
using Umbraco.Core.PropertyEditors;
using Umbraco.Web.PropertyEditors;

namespace Terratype.ListView
{
	[PropertyEditor(TerratypeListViewPropertyEditor.PropertyEditorAlias, TerratypeListViewPropertyEditor.PropertyEditorName, "/App_Plugins/Terratype.ListView/views/editor.html?cache=1.0.16", ValueType = PropertyEditorValueTypes.Text, Group = "Map", Icon = "icon-map-location")]
#if DEBUG
	[PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/Terratype.ListView/scripts/terratype.listview.js?cache=1.0.17")]
#else
	[PropertyEditorAsset(ClientDependencyType.Javascript, "/App_Plugins/Terratype.ListView/scripts/terratype.listview.min.js?cache=1.0.17")]
#endif
    public class TerratypeListViewPropertyEditor : PropertyEditor
	{
		public const string PropertyEditorAlias = nameof(Terratype) + "." + nameof(Terratype.ListView);
		public const string PropertyEditorName = nameof(Terratype) + " " + nameof(Terratype.ListView);

		protected override PreValueEditor CreatePreValueEditor()
		{
			return new TerratypeListViewPreValueEditor();
		}

		public TerratypeListViewPropertyEditor()
		{
            _defaultPreVals = new Dictionary<string, object>
            {
                { "definition", "{ \"datatype\": -1}" }
            };
		}

        private IDictionary<string, object> _defaultPreVals;
		public override IDictionary<string, object> DefaultPreValues
		{
			get { return _defaultPreVals; }
			set { _defaultPreVals = value; }
		}

		internal class TerratypeListViewPreValueEditor : PreValueEditor
		{
			[PreValueField("definition", "Config", "/App_Plugins/Terratype.ListView/views/config.html?cache=1.0.17", Description = "", HideLabel = true)]
            public Models.Model Definition { get; set; }

        }
	}
}
