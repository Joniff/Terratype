using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;

namespace Terratype.Providers
{
    [JsonObject(MemberSerialization.OptIn)]
    public class GoogleMapsV3 : Models.Provider
    {
        [JsonProperty]
        public override string Id
        {
            get
            {
                return "Terratype.GoogleMapsV3";
            }
        }

        public override string Name
        {
            get
            {
                return "terratypeGoogleMapsV3_name";            //  Value is in the language file
            }
        }

        public override string Description
        {
            get
            {
                return "terratypeGoogleMapsV3_description";     //  Value is in the language file
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "terratypeGoogleMapsV3_referenceUrl";    //  Value is in the language file
            }
        }

        public override IDictionary<string, Type> CoordinateSystems
        {
            get
            {
                var wgs84 = new CoordinateSystems.Wgs84();
                var gcj02 = new CoordinateSystems.Gcj02();

                return new Dictionary<string, Type>
                {
                    { wgs84.Id, wgs84.GetType() },
                    { gcj02.Id, gcj02.GetType() }
                };
            }
        }

        public override bool CanSearch
        {
            get
            {
                return true;
            }
        }

        [JsonProperty]
        public string Version { get; set; }

        /// <summary>
        /// API Key from https://console.developers.google.com/apis/credentials
        /// </summary>
        [JsonProperty]
        public string ApiKey { get; set; }

        [JsonProperty]
        public bool ForceHttps { get; set; }

        [JsonProperty]
        public string Language { get; set; }

        [JsonProperty]
        public string PredefineStyling { get; set; }

        [JsonProperty]
        public bool ShowRoads { get; set; }

        [JsonProperty]
        public bool ShowLandmarks { get; set; }

        [JsonProperty]
        public bool ShowLabels { get; set; }

        [JsonProperty]
        public dynamic Styling { get; set; }

        /// <summary>
        /// Where are the controls situation
        /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#ControlPosition
        /// </summary>
        public enum ControlPositions
        {       //  In order from top left to bottom right
            Default = 0,
            TopLeft = 1,           // Top left and flow towards the middle.
            TopCenter = 2,          // Center of the top row.
            TopRight = 3,           // Top right and flow towards the middle
            LeftTop = 5,            // On the left, below top-left elements, and flow downwards.
            RightTop = 7,           // On the right, below top-right elements, and flow downwards.
            LeftCenter = 4,         // Center of the left side.
            Center = 13,
            RightCenter = 8,        // Center of the right side.
            LeftBottom = 6,         // On the left, above bottom-left elements, and flow upwards.
            RightBottom = 9,        // On the right, above bottom-right elements, and flow upwards.
            BottomLeft = 10,         // Bottom left and flow towards the middle. Elements are positioned to the right of the Google logo.
            BottomCenter = 11,       // Center of the bottom row.
            BottomRight = 12        // Bottom right and flow towards the middle. Elements are positioned to the left of the copyrights.
        }

        /// <summary>
        /// Control styles
        /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapType
        /// </summary>
        [JsonObject(MemberSerialization.OptIn)]
        public class VarietyDefinition
        {
            public enum SelectorType
            {
                Default = 0,
                HorizontalBar = 1,
                DropdownMenu = 2
            }

            public class SelectorDefinition
            {
                [JsonProperty]
                public SelectorType Type { get; set; }

                [JsonProperty]
                public ControlPositions Position { get; set; }
            }

            [JsonProperty]
            public bool Basic { get; set; }
            [JsonProperty]
            public bool Satellite { get; set; }
            [JsonProperty]
            public bool Terrain { get; set; }

            [JsonProperty]
            public SelectorDefinition Selector { get; set; }
        }

        [JsonProperty]
        public VarietyDefinition Variety { get; set; }

        [JsonObject(MemberSerialization.OptIn)]
        public class Control
        {
            [JsonProperty]
            public bool Enable { get; set; }
            [JsonProperty]
            public ControlPositions Position { get; set; }
        }

        [JsonProperty]
        public Control StreetView { get; set; }

        [JsonProperty]
        public Control Fullscreen { get; set; }

        [JsonProperty]
        public Control Scale { get; set; }

        [JsonProperty]
        public Control ZoomControl { get; set; }


        public class SearchDefinition
        {
            public enum SearchStatus { Disable = 0, Enable, Autocomplete };

            public SearchStatus Enable { get; set; }

            public class LimitDefinition
            {
                public IEnumerable<string> Countries { get; set; }
            }
            public LimitDefinition Limit { get; set; }
        }

        [JsonProperty]
        public SearchDefinition Search { get; set; }

        private string GoogleScript(Models.Model model)
        {
            var url = new StringBuilder();

            var provider = model.Provider as GoogleMapsV3;

            if (provider.ForceHttps)
            {
                url.Append("https:");
            }

            url.Append(String.Equals(model.Position.Id, Terratype.CoordinateSystems.Gcj02._Id, StringComparison.InvariantCultureIgnoreCase) ?
                "//maps.google.cn" : "//maps.googleapis.com/");

            url.Append("maps/api/js?v=");
            url.Append(String.IsNullOrWhiteSpace(provider.Version) ? "3" : provider.Version);
            url.Append(@"&libraries=places&callback=TerratypeGoogleMapsV3CallbackRender");
            if (!String.IsNullOrWhiteSpace(provider.ApiKey))
            {
                url.Append(@"&key=");
                url.Append(provider.ApiKey);
            }
            if (!String.IsNullOrWhiteSpace(provider.Language))
            {
                url.Append(@"&language=");
                url.Append(provider.Language);
            }
            return url.ToString();
        }

        private void Resource(string resourceName, HtmlTextWriter writer)
        {
            using (var stream = Assembly.GetExecutingAssembly().GetManifestResourceStream(resourceName))
            {
                using (var reader = new StreamReader(stream))
                {
                    writer.Write(reader.ReadToEnd());
                }
            }
        }

        public override IHtmlString GetHtml(Models.Model model, int height = 400, string language = null)
        {
            var guid = new Guid("b72310d2-7041-4234-a6c5-6c5c2fdd708e");
            var id = "gmapv3_" + DateTime.Now.Ticks.ToString();

            var builder = new StringWriter(System.Globalization.CultureInfo.InvariantCulture);
            using (var writer = new HtmlTextWriter(builder))
            {
                writer.RenderBeginTag(HtmlTextWriterTag.Div);
                if (!HttpContext.Current.Items.Contains(guid))
                {
                    HttpContext.Current.Items.Add(guid, true);
                    writer.RenderBeginTag(HtmlTextWriterTag.Script);
                    Resource("Terratype.GoogleMapsV3.Scripts.Render.js", writer);
                    writer.RenderEndTag();

                    writer.AddAttribute(HtmlTextWriterAttribute.Src, GoogleScript(model));
                    writer.AddAttribute("defer", "");
                    writer.RenderBeginTag(HtmlTextWriterTag.Script);
                    writer.RenderEndTag();
                }

                writer.RenderBeginTag(HtmlTextWriterTag.Script);
                writer.Write("var ");
                writer.Write(id);
                writer.Write("=");
                writer.WriteLine(JsonConvert.SerializeObject(model));
                writer.Write(";");
                writer.Write(id);
                writer.Write(".id='");
                writer.Write(id);
                writer.Write("';window.terratype_gmapsv3.maps.push(");
                writer.Write(id);
                writer.WriteLine(");");
                writer.RenderEndTag();

                writer.AddAttribute(HtmlTextWriterAttribute.Id, id);
                writer.AddStyleAttribute(HtmlTextWriterStyle.Height, height.ToString() + "px");
                writer.RenderBeginTag(HtmlTextWriterTag.Div);
                writer.RenderEndTag();

                writer.RenderEndTag();
            }

            return new HtmlString(builder.ToString());
        }

    }
}
