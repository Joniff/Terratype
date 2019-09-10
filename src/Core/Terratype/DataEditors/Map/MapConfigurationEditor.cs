using System.Collections.Generic;
using Umbraco.Core.IO;
using Umbraco.Core.PropertyEditors;

namespace Terratype.DataEditors.Map
{
	public class MapConfigurationEditor : ConfigurationEditor
	{
		public MapConfigurationEditor() : base()
		{
			Fields.Add(new ConfigurationField
			{
				Key = "definition",
				Name = "definition",
				View = "/App_Plugins/Terratype/views/config.html?cache=2.0.0",
				HideLabel = true,
				Description = ""
			});
		}
	}
}

