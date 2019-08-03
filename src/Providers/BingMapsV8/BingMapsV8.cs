using System;
using System.Collections.Generic;
using System.Text;
using System.Web;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.Providers
{
	[JsonObject(MemberSerialization.OptIn)]
	public class BingMapsV8 : Models.Provider
	{
		private string UrlPath(string file, bool cache = true)
		{
			var result = "/App_Plugins/Terratype.BingMapsV8/" + file;
			if (cache)
			{
				result += "?cache=1.0.21";
			}
			return result;
		}
		
		public const string _Id = "Terratype.BingMapsV8";
		public override string Id => _Id;

		public override string Name => "terratypeBingMapsV8_name";              //  Value is in language file

		public override string Description => "terratypeBingMapsV8_description";       //  Value is in language file

		public override string ReferenceUrl => "terratypeBingMapsV8_description";       //  Value is in language file

		public override bool CanSearch => true;

		public override IEnumerable<string> CoordinateSystems
		{
			get
			{
				return new string[]
				{
					Terratype.CoordinateSystems.Wgs84._Id
				};
			}
		}

		[JsonProperty(PropertyName = "version")]
		public string Version { get; set; }

		/// <summary>
		/// API Key from https://console.developers.google.com/apis/credentials
		/// </summary>
		[JsonProperty(PropertyName = "apiKey")]
		public string ApiKey { get; set; }

		[JsonProperty(PropertyName = "forceHttps")]
		public bool ForceHttps { get; set; }

		[JsonProperty(PropertyName = "language")]
		public string Language { get; set; }

		[JsonProperty(PropertyName = "predefineStyling")]
		public string PredefineStyling { get; set; }

		[JsonObject(MemberSerialization.OptIn)]
		public class SearchDefinition
		{
			public enum SearchStatus { Disable = 0, Enable, Autocomplete };

			[JsonProperty(PropertyName = "enable")]
			public SearchStatus Enable { get; set; }
		}

		[JsonProperty(PropertyName = "search")]
		public SearchDefinition Search { get; set; }

		[JsonObject(MemberSerialization.OptIn)]
		public class VarietyDefinition
		{
			[JsonProperty(PropertyName = "basic")]
			public bool Basic { get; set; }

			[JsonProperty(PropertyName = "satellite")]
			public bool Satellite { get; set; }

			[JsonProperty(PropertyName = "streetView")]
			public bool StreetView { get; set; }
		}

		[JsonProperty(PropertyName = "variety")]
		public VarietyDefinition Variety { get; set; }

		[JsonObject(MemberSerialization.OptIn)]
		public class Control
		{
			[JsonProperty(PropertyName = "enable")]
			public bool Enable { get; set; }

		}

		[JsonProperty(PropertyName = "breadcrumb")]
		public Control Breadcrumb { get; set; }

		[JsonProperty(PropertyName = "dashboard")]
		public Control Dashboard { get; set; }

		[JsonProperty(PropertyName = "scale")]
		public Control Scale { get; set; }

		[JsonProperty(PropertyName = "zoomControl")]
		public Control ZoomControl { get; set; }

		[JsonObject(MemberSerialization.OptIn)]
		public class TrafficDefinition
		{
			[JsonProperty(PropertyName = "enable")]
			public bool Enable { get; set; }

			[JsonProperty(PropertyName = "legend")]
			public bool Legend { get; set; }
		}

		[JsonProperty(PropertyName = "traffic")]
		public TrafficDefinition Traffic { get; set; }

		[JsonProperty(PropertyName = "showLabels")]
		public bool ShowLabels { get; set; }

		private string BingScript(Models.Model model)
		{
			var url = new StringBuilder();

			var provider = model.Provider as BingMapsV8;

			if (provider.ForceHttps)
			{
				url.Append("https:");
			}

			url.Append(String.Equals(model.Position.Id, Terratype.CoordinateSystems.Gcj02._Id, StringComparison.InvariantCultureIgnoreCase) ?
				"//www.bing.com/" : "//www.bing.com/");

			url.Append("api/maps/mapcontrol?branch=");
			url.Append(String.IsNullOrWhiteSpace(provider.Version) ? "release" : provider.Version);
			url.Append(@"&callback=TerratypeBingMapsV8CallbackRender");
			if (!String.IsNullOrWhiteSpace(provider.Language))
			{
				url.Append(@"&mkt=");
				url.Append(provider.Language);
			}
			return url.ToString();
		}

		/// <summary>
		/// Returns the Html that renders this map
		/// </summary>
		/// <param name="model"></param>
		/// <param name="height"></param>
		/// <param name="language"></param>
		/// <param name="label"></param>
		/// <returns></returns>
		public override void Render(Guid guid, HtmlTextWriter writer, int mapId, Models.Model model, string labelId = null, int? height = null, 
			string language = null, Options.DomMonitorTypes domMonitorType = Options.DomMonitorTypes.Javascript,
			bool AutoShowLabel = false, bool AutoRecenterAfterRefresh = false, bool AutoFit = false, string Tag = null)
		{
			var generatedId = nameof(Terratype) + nameof(BingMapsV8) + guid.ToString();
			if (Tag == null) 
			{
				Tag = generatedId;
			}

			writer.AddAttribute("data-model", HttpUtility.UrlEncode(JsonConvert.SerializeObject(model), System.Text.Encoding.Default));
			writer.AddAttribute("data-map-id", mapId.ToString());
			writer.AddAttribute("data-dom-detection-type", ((int) domMonitorType).ToString());
			if (AutoShowLabel)
			{
				writer.AddAttribute("data-auto-show-label", true.ToString());
			}
			if (AutoRecenterAfterRefresh)
			{
				writer.AddAttribute("data-recenter-after-refresh", true.ToString());
			}
			if (AutoFit)
			{
				writer.AddAttribute("data-auto-fit", true.ToString());
			}
			if (labelId != null)
			{
				writer.AddAttribute("data-label-id", labelId);
			}
			writer.AddAttribute("data-id", generatedId);
			writer.AddAttribute("data-tag", Tag);
			writer.AddStyleAttribute(HtmlTextWriterStyle.Display, "none");
			writer.AddAttribute(HtmlTextWriterAttribute.Class, nameof(Terratype) + '.' + nameof(BingMapsV8));
			writer.RenderBeginTag(HtmlTextWriterTag.Div);

			const string addScriptOnce = "af82089e-e9b9-4b8b-9f2a-bed92279dc6b";
			if (model.Icon != null && !HttpContext.Current.Items.Contains(addScriptOnce))
			{
				HttpContext.Current.Items.Add(addScriptOnce, true);
#if DEBUG
				writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/Terratype.BingMapsV8.Renderer.js"));
#else
				writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/Terratype.BingMapsV8.Renderer.min.js"));
#endif
				writer.AddAttribute("defer", "");
				writer.RenderBeginTag(HtmlTextWriterTag.Script);
				writer.RenderEndTag();

				writer.AddAttribute(HtmlTextWriterAttribute.Src, BingScript(model));
				writer.AddAttribute("defer", "");
				writer.RenderBeginTag(HtmlTextWriterTag.Script);
				writer.RenderEndTag();
			}

			writer.WriteFullBeginTag("style");

			writer.Write('#');
			writer.Write(generatedId);
			writer.WriteLine(" .switchSlot.labelToggle {display:none;}");


			var provider = model.Provider as Terratype.Providers.BingMapsV8;
			if (provider.Variety.Basic == false || (provider.Variety.Basic == true && provider.PredefineStyling == "ordnanceSurvey"))
			{
				writer.Write('#');
				writer.Write(generatedId);
				writer.WriteLine(" .slot.road {display:none;}");
			}
			if (provider.Variety.Basic == false || (provider.Variety.Basic == true && provider.PredefineStyling != "ordnanceSurvey"))
			{
				writer.Write('#');
				writer.Write(generatedId);
				writer.WriteLine(" .slot.ordnanceSurvey {display:none;}");
			}
			if (provider.Variety.Satellite == false)
			{
				writer.Write('#');
				writer.Write(generatedId);
				writer.WriteLine(" .slot.aerial {display:none;}");
			}
			if (provider.Variety.StreetView == false)
			{
				writer.Write('#');
				writer.Write(generatedId);
				writer.WriteLine(" .slot.streetside {display:none;}");
			}
			if (provider.Variety.Basic == false && provider.Variety.Satellite == false && provider.Variety.StreetView == true)
			{
				writer.Write('#');
				writer.Write(generatedId);
				writer.WriteLine(" .streetsideExit {display:none;}");
			}
			if (provider.Breadcrumb.Enable == false)
			{
				writer.Write('#');
				writer.Write(generatedId);
				writer.WriteLine(" streetsideText {display:none;}");
			}
			writer.WriteEndTag("style");

			writer.AddStyleAttribute(HtmlTextWriterStyle.Height, (height != null ? height : model.Height).ToString() + "px");
			writer.RenderBeginTag(HtmlTextWriterTag.Div);
			writer.AddAttribute(HtmlTextWriterAttribute.Id, generatedId);
			writer.AddStyleAttribute("opacity", "0.0");
			writer.AddStyleAttribute("filter", "alpha(opacity=0)");
			writer.RenderBeginTag(HtmlTextWriterTag.Div);
			writer.RenderEndTag();
			writer.RenderEndTag();
			writer.RenderEndTag();
		}
		public override IEnumerable<Models.Label> Labels
		{
			get
			{
				return new Models.Label[]
				{
					new Labels.Standard()
				};
			}
		}
	}
}
