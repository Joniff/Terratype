using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace Terratype.Providers
{
    [JsonObject(MemberSerialization.OptIn)]
    public class GoogleMapsV3 : ProviderBase
    {
        [JsonProperty]
        public override string Id
        {
            get
            {
                return "GoogleMapsV3";
            }
        }

        public override string Name
        {
            get
            {
                return "Google Maps V3";
            }
        }

        public override string Description
        {
            get
            {
                return "Mapping system delivered by Google. Requires an API key and is free upto 25,000 map loads per 24 hour period, then $0.50 per 1000 addition requests";
            }
        }

        public override string ReferenceUrl
        {
            get
            {
                return "https://developers.google.com/maps/documentation/javascript/";
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

        public class Search
        {
            public string Status { get; set; }

            public Limit Limit { get; set; }
        }

        public class Limit
        {
            public string Country { get; set; }
        }

        [JsonProperty]
        public Search SearchCriteria { get; set; }

        /// <summary>
        /// API Key from https://console.developers.google.com/apis/credentials
        /// </summary>
        [JsonProperty]
        public string ApiKey { get; set; }

        [JsonProperty]
        public bool ForceHttps { get; set; }

        /// <summary>
        /// Where are the controls situation
        /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#ControlPosition
        /// </summary>
        public enum ControlPositions
        {
            Default = 0,
            BottomCenter = 1,       // Center of the bottom row.
            BottomLeft = 2,         // Bottom left and flow towards the middle. Elements are positioned to the right of the Google logo.
            BottomRight = 3,        // Bottom right and flow towards the middle. Elements are positioned to the left of the copyrights.
            LeftBottom = 4,         // On the left, above bottom-left elements, and flow upwards.
            LeftCenter = 5,         // Center of the left side.
            LeftTop = 6,            // On the left, below top-left elements, and flow downwards.
            RightBottom = 7,        // On the right, above bottom-right elements, and flow upwards.
            RightCenter = 8,        // Center of the right side.
            RightTop = 9,           // On the right, below top-right elements, and flow downwards.
            TopCenter = 10,          // Center of the top row.
            TopLeft = 11,           // Top left and flow towards the middle.
            TopRight = 12           // Top right and flow towards the middle
        }

        /// <summary>
        /// Control styles
        /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapType
        /// </summary>
        [JsonObject(MemberSerialization.OptIn)]
        public class MapTypeDefinition
        {
            /// <summary>
            /// Map types that Google map understands, 
            /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapTypeId
            /// </summary>
            public enum BasicMapTypes
            {
                Hybrid = 1,
                Roadmap = 2,
                Satellite = 3,
                Terrain = 4
            }

            public enum Styles
            {
                Default = 0,
                DropdownMenu = 1,
                HorizontalBar = 2
            }

            [JsonProperty]
            public BasicMapTypes MapType { get; set; }
            [JsonProperty]
            public Styles Style { get; set; }
}

        [JsonProperty]
        public MapTypeDefinition MapType { get; set; }

        public enum PredefineMapColors
        {
            Standard = 0,
            Silver = 1,
            Retro = 2,
            Dark = 3,
            Night = 4,
            Desert = 5,
            Blush = 6
        }


        [JsonProperty]
        public PredefineMapColors PredefineMapColor { get; set; }

        [JsonProperty]
        public bool ShowRoads { get; set; }

        [JsonProperty]
        public bool ShowLandmarks { get; set; }

        [JsonProperty]
        public bool ShowLabels { get; set; }


        [JsonObject(MemberSerialization.OptIn)]
        public class StreetViewControlDefinition
        {
            [JsonProperty]
            public bool Enable { get; set; }
            [JsonProperty]
            public ControlPositions Position { get; set; }
        }

        [JsonProperty]
        public StreetViewControlDefinition StreetViewControl { get; set; }

        public bool MapScaleControl { get; set; }

        public bool FullScreenControl { get; set; }


        [JsonObject(MemberSerialization.OptIn)]
        public class ZoomControlDefinition
        {
            public enum ZoomControlStyles
            {
                Default = 0,
                Large = 1,
                Small = 2
            };

            [JsonProperty]
            public bool Enable { get; set; }
            [JsonProperty]
            public ControlPositions Position { get; set; }

            public ZoomControlStyles ZoomControlStyle { get; set; }
        }

        /// <summary>
        /// 
        /// </summary>
        [JsonProperty]
        public ZoomControlDefinition ZoomControl { get; set; }


        [JsonObject(MemberSerialization.OptIn)]
        public class PanControlDefinition
        {
            [JsonProperty]
            public bool Enable { get; set; }

            [JsonProperty]
            public ControlPositions Position { get; set; }
        }

        [JsonProperty]
        public PanControlDefinition PanControl { get; set; }

        [JsonProperty]
        public bool Draggable { get; set; }

        [JsonProperty]
        public string Language { get; set; }

    }
}
