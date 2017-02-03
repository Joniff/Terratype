using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace Terratype.Providers.OSOpenSpaceV4
{
    [JsonObject(MemberSerialization.OptIn)]
    public class Provider : Models.Provider
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
                return "terratypeOSOpenSpaceV4_name";               //  Value in language file
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
                return "terratypeOSOpenSpaceV4_referenceUrl";       //  Value in language file
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
