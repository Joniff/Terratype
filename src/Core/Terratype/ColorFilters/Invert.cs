using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.ColorFilters
{
	public class Invert : ColorFilterBase
	{
		public const string _Id = "invert";

		[JsonProperty]
		public override string Id => _Id;
		public override string Name => "terratypeColorFilterInvert_name";
		public override string Description => "terratypeColorFilterHueRotate_description";
		
		public override void Render(HtmlTextWriter writer) => writer.Write("-webkit-filter: invert(" + Value.ToString() + "%); filter: invert(" + Value.ToString() + "%);");
	}
}
