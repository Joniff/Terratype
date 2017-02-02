using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace Terratype.Providers.OSOpenSpaceV4
{
    [JsonObject(MemberSerialization.OptIn)]
    public class Provider : Terratype.Providers.Provider
    {
        [JsonProperty]
        public override string Id
        {
            get
            {
                return "Terratype.OSOpenSpaceV4";
            }
        }

        public override string Name
        {
            get
            {
                return "OS OpenSpace V4 (UK only)";
            }
        }

        public override string Description
        {
            get
            {
                return "terratypeOSOpenSpaceV4_description";        //  Value in language file
            }
        }


        public override string ReferenceUrl
        {
            get
            {
                return "https://www.ordnancesurvey.co.uk/innovate/innovate-with-open-space.html";
            }
        }
        public override IDictionary<string, Type> CoordinateSystems
        {
            get
            {
                var osdb36 = new CoordinateSystems.Osgb36();

                return new Dictionary<string, Type>
                {
                    { osdb36.Id, osdb36.GetType() }
                };
            }
        }

    }
}
