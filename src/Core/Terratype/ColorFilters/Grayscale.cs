using System;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.ColorFilters
{
	public class Greyscale : Models.ColorFilter
	{
		public const string _Id = "greyscale";

		[JsonProperty]
		public override string Id => _Id;
		public override string Name => "terratypeColorFilterGreyscale_name";
		
		[JsonProperty(PropertyName = "percent")]
		public int Percent;

		public override void Render(HtmlTextWriter writer) => writer.Write("-webkit-filter: greyscale(" + Percent.ToString() + "%); filter: greyscale(" + Percent.ToString() + "%);");
	}
}
