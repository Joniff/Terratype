using System;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.ColorFilters
{
	public class Sepia : Models.ColorFilter
	{
		public const string _Id = "sepia";

		[JsonProperty]
		public override string Id => _Id;
		public override string Name => "terratypeColorFilterSepia_name";
		
		[JsonProperty(PropertyName = "percent")]
		public int Percent;

		public override void Render(HtmlTextWriter writer) => writer.Write("-webkit-filter: sepia(" + Percent.ToString() + "%); filter: sepia(" + Percent.ToString() + "%);");
	}
}
