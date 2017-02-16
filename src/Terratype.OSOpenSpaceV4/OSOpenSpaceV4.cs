using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Web;
using System.Web.UI;

namespace Terratype.Providers
{
    [JsonObject(MemberSerialization.OptIn)]
    public class OSOpenSpaceV4 : Models.Provider
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

        public override void GetHtml(HtmlTextWriter writer, int mapId, Models.Model model, string labelId = null, int? height = null, string language = null)
        {
            throw new NotImplementedException();
        }

    }
}
