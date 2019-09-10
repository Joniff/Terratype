using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.ColorFilters
{
	public class HueRotate : ColorFilterBase
	{
		public const string _Id = "huerotate";

		[JsonProperty]
		public override string Id => _Id;
		public override string Name => "terratypeColorFilterHueRotate_name";
		public override string Description => "terratypeColorFilterHueRotate_description";
		
		public override void Render(HtmlTextWriter writer) => writer.Write("-webkit-filter: hue-rotate(" + PercentageToDegree(Value).ToString() + "deg); filter: hue-rotate(" + PercentageToDegree(Value).ToString() + "deg);");
	}
}
