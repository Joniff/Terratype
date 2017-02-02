using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace Terratype.Providers.GoogleMapsV3
{
    [JsonObject(MemberSerialization.OptIn)]
    public class Provider : Terratype.Providers.Provider
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
                return "Google Maps V3";
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
            public enum Selectors
            {
                Default = 0,
                HorizontalBar = 1,
                DropdownMenu = 2
            }

            [JsonProperty]
            public bool Basic { get; set; }
            [JsonProperty]
            public bool Satellite { get; set; }
            [JsonProperty]
            public bool Terrain { get; set; }

            [JsonProperty]
            public Selectors Selector { get; set; }

            [JsonProperty]
            public ControlPositions Position { get; set; }

        }

        [JsonProperty]
        public VarietyDefinition Variety { get; set; }

        [JsonProperty]
        public string PredefineStyling { get; set; }

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
