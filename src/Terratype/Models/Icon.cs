using System;

namespace Terratype.Models
{
    public class Icon
    {
        public Uri Image { get; set; }

        public Uri ShadowImage { get; set; }

        public Size Size { get; set; }

        public Anchor Anchor { get; set; }
    }
}
