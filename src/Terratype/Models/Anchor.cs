using System.Diagnostics;

namespace Terratype.Models
{
    [DebuggerDisplay("{Horizontal} {Vertical}")]
    public class Anchor
    {
        public AnchorHorizontal Horizontal { get; set; }

        public AnchorVertical Vertical { get; set; }

        public Anchor()
        {
            Horizontal = Terratype.Models.AnchorHorizontal.Style.Center;
            Vertical = Terratype.Models.AnchorVertical.Style.Bottom;
        }
    }
}
