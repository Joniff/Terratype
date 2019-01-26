using System;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.ColorFilters
{
	public class HueRotate : Models.ColorFilter
	{
		public const string _Id = "huerotate";

		[JsonProperty]
		public override string Id => _Id;
		public override string Name => "terratypeColorFilterHueRotate_name";
		
		[JsonProperty(PropertyName = "degree")]
		public int Degree;

		public override void Render(HtmlTextWriter writer) => writer.Write("-webkit-filter: hue-rotate(" + Degree.ToString() + "deg); filter: hue-rotate(" + Degree.ToString() + "deg);");
	}
}
