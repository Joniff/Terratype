using System;
using System.Web.UI;
using Terratype.Discover;

namespace Terratype.Labels
{
	public interface ILabel : IDiscover
	{
		/// <summary>
		/// Does this map have a label that the editor can edit
		/// </summary>
		bool Enable { get; }

		EditPositions EditPosition { get; }

		/// <summary>
		/// Has this lable got some content. False = The content editor has left this label blank
		/// </summary>
		bool HasContent { get; }

		void Render(Guid key, HtmlTextWriter writer, IMap map);

	}
}

