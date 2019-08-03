using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;
using Newtonsoft.Json;

namespace Terratype.Providers
{
	[JsonObject(MemberSerialization.OptIn)]
	public class LeafletV1 : Models.Provider
	{
		private string UrlPath(string file, bool cache = true)
		{
			var result = "/App_Plugins/Terratype.LeafletV1/" + file;
			if (cache)
			{
				result += "?cache=1.0.21";
			}
			return result;
		}

		public const string _Id = "Terratype.LeafletV1";

		public override string Id => _Id;

		public override string Name => "terratypeLeafletV1_name";                   //  Value in language file

		public override string Description => "terratypeLeafletV1_description";            //  Value in language file

		public override string ReferenceUrl => "terratypeLeafletV1_referenceUrl";            //  Value in language file

		public override IEnumerable<string> CoordinateSystems
		{
			get
			{
				return new string[] 
				{
					Terratype.CoordinateSystems.Wgs84._Id,
					Terratype.CoordinateSystems.Gcj02._Id
				};
			}
		}
		public override bool CanSearch => true;


		[JsonObject(MemberSerialization.OptIn)]
		public class MapSourceDefinition
		{
			[JsonObject(MemberSerialization.OptIn)]
			public class TileServerDefinition
			{
				[JsonProperty(PropertyName = "id")]
				public string Id { get; set; }
			}

			[JsonProperty(PropertyName = "tileServer")]
			public TileServerDefinition TileServer { get; set; }

			[JsonProperty(PropertyName = "minZoom")]
			public int MinZoom { get; set; }

			[JsonProperty(PropertyName = "maxZoom")]
			public int MaxZoom { get; set; }

			[JsonProperty(PropertyName = "key")]
			public string Key { get; set; }
		}

		[JsonProperty(PropertyName = "mapSources")]
		public IEnumerable<MapSourceDefinition> MapSources { get; set; }

		public enum ControlPositions
		{
			TopLeft = 1,
			TopRight = 3,
			BottomLeft = 10,
			BottomRight = 12
		}

		[JsonObject(MemberSerialization.OptIn)]
		public class ZoomControlDefinition
		{
			[JsonProperty(PropertyName = "enable")]
			public bool Enable { get; set; }

			[JsonProperty(PropertyName = "position")]
			public ControlPositions Position { get; set; }
		}

		[JsonProperty(PropertyName = "zoomControl")]
		public ZoomControlDefinition ZoomControl { get; set; }


		public override void Render(Guid guid, HtmlTextWriter writer, int mapId, Models.Model model, string labelId = null, int? height = null, 
			string language = null,Options.DomMonitorTypes domMonitorType = Options.DomMonitorTypes.Javascript,
			bool AutoShowLabel = false, bool AutoRecenterAfterRefresh = false, bool AutoFit = false, string Tag = null)
		{
			var generatedId = nameof(Terratype) + nameof(LeafletV1) + Guid.NewGuid().ToString();
			if (Tag == null) 
			{
				Tag = generatedId;
			}
			writer.AddAttribute("data-css-files", HttpUtility.UrlEncode(JsonConvert.SerializeObject(new string[] 
			{
				UrlPath("css/leaflet.css"),
				UrlPath("css/MarkerCluster.css"),
				UrlPath("css/MarkerCluster.Default.css")
			}), System.Text.Encoding.Default));
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
			writer.AddAttribute(HtmlTextWriterAttribute.Class, nameof(Terratype) + '.' + nameof(LeafletV1));
			writer.RenderBeginTag(HtmlTextWriterTag.Div);

			const string addScriptOnce = "53031a3b-dc6a-4440-a5e5-5060f691afd6";
			if (model.Icon != null && !HttpContext.Current.Items.Contains(addScriptOnce))
			{
				HttpContext.Current.Items.Add(addScriptOnce, true);
#if DEBUG
				writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/Terratype.LeafletV1.Renderer.js"));
#else
				writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/Terratype.LeafletV1.Renderer.bundle.js"));
#endif
				writer.AddAttribute("defer", "");
				writer.RenderBeginTag(HtmlTextWriterTag.Script);
				writer.RenderEndTag();

#if DEBUG
				writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/leaflet-src.js"));
				writer.AddAttribute("defer", "");
				writer.RenderBeginTag(HtmlTextWriterTag.Script);
				writer.RenderEndTag();

				writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/leaflet.markercluster-src.js"));
				writer.AddAttribute("defer", "");
				writer.RenderBeginTag(HtmlTextWriterTag.Script);
				writer.RenderEndTag();

				writer.AddAttribute(HtmlTextWriterAttribute.Src, UrlPath("scripts/tileservers.js"));
				writer.AddAttribute("defer", "");
				writer.RenderBeginTag(HtmlTextWriterTag.Script);
				writer.RenderEndTag();
#endif
			}

			writer.AddAttribute(HtmlTextWriterAttribute.Id, generatedId);
			writer.AddStyleAttribute(HtmlTextWriterStyle.Height, (height != null ? height : model.Height).ToString() + "px");
			writer.AddStyleAttribute("opacity", "0.0");
			writer.AddStyleAttribute("filter", "alpha(opacity=0)");
			writer.RenderBeginTag(HtmlTextWriterTag.Div);
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
