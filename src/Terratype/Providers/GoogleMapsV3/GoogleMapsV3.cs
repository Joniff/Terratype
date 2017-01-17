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

        /// <summary>
        /// Map types that Google map understands, 
        /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapTypeId
        /// </summary>
        public enum MapTypes
        {
            Hybrid = 1,
            Roadmap = 2,
            Satellite = 3,
            Terrain = 4
        }


        [JsonProperty]
        public MapTypes MapType { get; set; }


        /// <summary>
        /// Control styles
        /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapTypeControlStyle
        /// </summary>
        public enum MapTypeControlStyles
        {
            Default = 0,
            DropdownMenu = 1,
            HorizontalBar = 2
        }

        [JsonProperty]
        public MapTypeControlStyles MapTypeControlStyle { get; set; }


        /// <summary>
        /// Where are the controls situation
        /// see https://developers.google.com/maps/documentation/javascript/3.exp/reference#ControlPosition
        /// </summary>
        public enum ControlPositions
        {
            BottomCenter = 0,       // Center of the bottom row.
            BottomLeft = 1,         // Bottom left and flow towards the middle. Elements are positioned to the right of the Google logo.
            BottomRight = 2,        // Bottom right and flow towards the middle. Elements are positioned to the left of the copyrights.
            LeftBottom = 3,         // On the left, above bottom-left elements, and flow upwards.
            LeftCenter = 4,         // Center of the left side.
            LeftTop = 5,            // On the left, below top-left elements, and flow downwards.
            RightBottom = 6,        // On the right, above bottom-right elements, and flow upwards.
            RightCenter = 7,        // Center of the right side.
            RightTop = 8,           // On the right, below top-right elements, and flow downwards.
            TopCenter = 9,          // Center of the top row.
            TopLeft = 10,           // Top left and flow towards the middle.
            TopRight = 11           // Top right and flow towards the middle
        }


    }
}
