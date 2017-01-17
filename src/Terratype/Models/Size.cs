using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Models
{
    
    [DebuggerDisplay("{Width}W x {Height}H")]
    public class Size
    {
        public int Width { get; set; }
        public int Height { get; set; }
    }
}
