using Umbraco.Core;
using Umbraco.Core.Composing;

namespace Terratype.Providers.GoogleMapsV3Core
{
	[RuntimeLevel(MinLevel = RuntimeLevel.Run)]
	public class Register : IUserComposer
	{
		public void Compose(Composition composition)
		{
			composition.Register<IProvider, GoogleMapsV3>();
		}
	}
}
