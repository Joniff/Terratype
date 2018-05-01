﻿using Newtonsoft.Json;
using System;

namespace Terratype.CoordinateSystems
{
    //  https://en.wikipedia.org/wiki/Restrictions_on_geographic_data_in_China#BD-09

    [JsonObject(MemberSerialization.OptIn)]
    public class Bd09 : Models.Position
    {
        public static string _Id = "BD09";

        [JsonProperty(PropertyName = "id")]
        public override string Id => _Id;
        public override string Name => "terratypeBd09_name";                    //  Value is in the language file
        public override string Description => "terratypeBd09_description";             //  Value is in the language file
        public override string ReferenceUrl => "terratypeBd09_referenceUrl";            //  Value is in the language file

        public override Models.LatLng ToWgs84()
        {
            throw new NotImplementedException();

        }

        public override void FromWgs84(Models.LatLng wgs84Position)
        {
            throw new NotImplementedException();
        }

        public Bd09()
        {
        }

        public Bd09(string initialPosition)
        {
            Parse(initialPosition);
        }
    }
}
