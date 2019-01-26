using System;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.ColorFilters
{
	public class Invert : Models.ColorFilter
	{
		public const string _Id = "invert";

		[JsonProperty]
		public override string Id => _Id;
		public override string Name => "terratypeColorFilterInvert_name";
		
		[JsonProperty(PropertyName = "percent")]
		public int Percent;

		public override void Render(HtmlTextWriter writer) => writer.Write("-webkit-filter: invert(" + Percent.ToString() + "%); filter: invert(" + Percent.ToString() + "%);");
	}
}
