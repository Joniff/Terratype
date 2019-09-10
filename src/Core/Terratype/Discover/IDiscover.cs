using System.Collections.Generic;
using Newtonsoft.Json;
using Umbraco.Core.Composing;

namespace Terratype.Discover
{
	public interface IDiscover : IDiscoverable
	{
		/// <summary>
		/// Id of provider
		/// </summary>
		[JsonProperty(PropertyName = "id")]
		string Id { get; }

		/// <summary>
		/// Name
		/// </summary>
		[JsonProperty(PropertyName = "name")]
		string Name { get; }

		/// <summary>
		/// Description
		/// </summary>
		[JsonProperty(PropertyName = "description")]
		string Description { get; }

		IEnumerable<T> GetAllInstances<T>();

		T GetInstance<T>(string id);
	}
}
