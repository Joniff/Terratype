using System.Collections.Generic;
using System.Diagnostics;
using Newtonsoft.Json;

namespace Terratype.Models
{
	[DebuggerDisplay("{Id}")]
	[JsonObject(MemberSerialization.OptIn, ItemTypeNameHandling = TypeNameHandling.All)]
	public class Address
	{
		public class AddressName
		{
			//	Full name
			[JsonProperty(PropertyName = "long")]
			public string Long { get; set; }

			//	Code or abbreviation 
			[JsonProperty(PropertyName = "short")]
			public string Short { get; set; }
		}

		//	Unique identifier for location, different systems will use different identifiers for same location
		[JsonProperty(PropertyName = "id")]
		public string Id { get; set; }

		[JsonProperty(PropertyName = "country")]
		public AddressName Country { get; set; }

		//	State or province
		[JsonProperty(PropertyName = "administrativeArea1")]
		public AddressName AdministrativeArea1 { get; set; }

		//	County
		[JsonProperty(PropertyName = "administrativeArea2")]
		public AddressName AdministrativeArea2 { get; set; }

		//	Area
		[JsonProperty(PropertyName = "locality")]
		public AddressName Locality { get; set; }

		//	Neighborhood
		[JsonProperty(PropertyName = "neighborhood")]
		public AddressName Neighborhood { get; set; }

		//	Street or road
		[JsonProperty(PropertyName = "route")]
		public AddressName Route { get; set; }

		//	Street number
		[JsonProperty(PropertyName = "premise")]
		public AddressName Premise { get; set; }

		//	Flat number or floor number
		[JsonProperty(PropertyName = "subpremise")]
		public AddressName Subpremise { get; set; }

		//	Postcode or Zip code
		[JsonProperty(PropertyName = "formatted")]
		public string Formatted { get; set; }

		//	Human readable formatted address
		[JsonProperty(PropertyName = "postalcode")]
		public string PostalCode { get; set; }

		//	If this address has any websites associated with it
		[JsonProperty(PropertyName = "urls")]
		public IEnumerable<string> Urls { get; set; }
	}
}
