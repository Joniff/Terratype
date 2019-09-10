using Umbraco.Core.PropertyEditors;

namespace Terratype.DataEditors.Map
{
	public class MapDataValueEditor : DataValueEditor
	{
		public MapDataValueEditor(DataEditorAttribute attribute) : base(attribute)
		{
		}

		//public override object Configuration
		//{
		//	get => base.Configuration;
		//	set => base.Configuration = value;
		//}
	}
}
