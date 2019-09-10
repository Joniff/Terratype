using Terratype.ColorFilters;
using Terratype.CoordinateSystems;
using Terratype.Labels;
using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Terratype
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		public void Compose(Composition composition)
		{
			composition.Register<IPosition, CoordinateSystems.Bd09>();
			composition.Register<IPosition, CoordinateSystems.Gcj02>();
			composition.Register<IPosition, CoordinateSystems.Wgs84>();

			composition.Register<ILabel, Labels.Standard>();

			composition.Register<IColorFilter, ColorFilters.Sepia>();
			composition.Register<IColorFilter, ColorFilters.Colorscale>();
			composition.Register<IColorFilter, ColorFilters.Grayscale>();
			composition.Register<IColorFilter, ColorFilters.HueRotate>();
			composition.Register<IColorFilter, ColorFilters.Invert>();
		}
	}
}
