using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.ColorFilters
{
	public class Colorscale : ColorFilterBase
	{
		public const string _Id = "colorscale";

		[JsonProperty(PropertyName = "id")]
		public override string Id => _Id;
		public override string Name => "terratypeColorFilterColorscale_name";
		public override string Description => "terratypeColorFilterColorscale_description";
		
		public override void Render(HtmlTextWriter writer) => writer.Write("-webkit-filter: grayscale(100%) sepia(100%) hue-rotate(" + PercentageToDegree(Value).ToString() + "deg); filter: grayscale(100%) sepia(100%) hue-rotate(" +PercentageToDegree(Value).ToString() + "deg)");
	}
}
