using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.ColorFilters
{
	public class Sepia : ColorFilterBase
	{
		public const string _Id = "sepia";

		[JsonProperty]
		public override string Id => _Id;
		public override string Name => "terratypeColorFilterSepia_name";
		public override string Description => "terratypeColorFilterSepia_description";
		
		public override void Render(HtmlTextWriter writer) => writer.Write("-webkit-filter: sepia(" + Value.ToString() + "%); filter: sepia(" + Value.ToString() + "%);");
	}
}
