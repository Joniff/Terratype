using System.Collections.Generic;
using Umbraco.Core.Composing;

namespace Terratype.Discover
{
	public interface IDiscover : IDiscoverable
	{
		/// <summary>
		/// Id of provider
		/// </summary>
		string Id { get; }

		/// <summary>
		/// Name
		/// </summary>
		string Name { get; }

		/// <summary>
		/// Description
		/// </summary>
		string Description { get; }

		IEnumerable<T> GetAllInstances<T>();

		T GetInstance<T>(string id);
	}
}
