using Terratype.Discover;

namespace Terratype.CoordinateSystems
{
	public interface IPosition : IDiscover
	{
		/// <summary>
		/// Url that a developer can use to get more information about this coordinate system
		/// </summary>
		string ReferenceUrl { get; }

		int Precision { get; }

		/// <summary>
		/// To display position to user
		/// </summary>
		/// <returns></returns>
		string ToString();

		/// <summary>
		/// Parses human readable position
		/// </summary>
		void Parse(string datum);

		/// <summary>
		/// Parses human readable position if possible
		/// </summary>
		bool TryParse(string datum);

		/// <summary>
		/// Convert the current position to a Wgs84 location
		/// </summary>
		/// <returns>A Wgs84 location</returns>
		LatLng ToWgs84();

		/// <summary>
		/// Set the position to the Wgs84 location provided
		/// </summary>
		void FromWgs84(LatLng wgs84Position);

		/// <summary>
		/// Distance in meters between this position and another position using Haversine formula
		/// </summary>
		/// <param name="other">The other position to compare distance against</param>
		/// <returns>Number of km between the two positions</returns>
		double Distance(IPosition other);

		/// <summary>
		/// Distance in km between this position and another position
		/// </summary>
		/// <param name="other">The other position to compare distance against</param>
		/// <returns>Number of km between the two positions</returns>
		double DistanceInKm(IPosition other);

		/// <summary>
		/// Distance in miles between this position and another position
		/// </summary>
		/// <param name="other">The other position to compare distance against</param>
		/// <returns>Number of miles between the two positions</returns>
		double DistanceInMiles(IPosition other);

		/// <summary>
		/// Are the two positons referencesing the same location, within a margin of error
		/// </summary>
		/// <param name="other">The other position to compare against</param>
		/// <returns>True if the two positons are referencing the same position</returns>
		bool Equal(IPosition other);
	}
}
