using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Models
{

    [DebuggerDisplay("{DebugValue}")]
    public class AnchorHorizontal
    {
        public enum Style { Left = -9999, Center, Right };
        
        private int _value;
        public int Manual 
        { 
            get
            {
                return _value;
            }
            set
            {
                _value = value;
            }
        }

        public Style Automatic
        {
            get
            {
                return (Style) _value;
            }
            set
            {
                _value = (int) value;
            }
        }

        public bool IsManual()
        {
            return (_value > (int) Style.Right) ? true : false;
        }

        public AnchorHorizontal()
        {
        }

        public AnchorHorizontal(Style value)
        {
            Automatic = value;
        }

        public AnchorHorizontal(int value)
        {
            Manual = value;
        }

        public AnchorHorizontal(string value)
        {
            Automatic = Models.AnchorHorizontal.Style.Center;
            if (string.IsNullOrWhiteSpace(value))
                return;

            switch (value[0])
            {
                case '-':
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    int discrete;
                    if (int.TryParse(value, out discrete))
                        Manual = discrete;
                    break;

                case 'l':
                case 'L':
                    Automatic = Models.AnchorHorizontal.Style.Left;
                    break;

                case 'r':
                case 'R':
                    Automatic = Models.AnchorHorizontal.Style.Right;
                    break;
            }
        }

        public static implicit operator AnchorHorizontal(string value)
        {
            return new AnchorHorizontal(value);
        }

        public static implicit operator AnchorHorizontal(Style value)
        {
            return new AnchorHorizontal(value);
        }

        public static implicit operator AnchorHorizontal(int value)
        {
            return new AnchorHorizontal(value);
        }

        public static implicit operator string(AnchorHorizontal anchor)
        {
            return (anchor.IsManual()) ? anchor.Manual.ToString() : anchor.Automatic.ToString();
        }

        public static implicit operator Style(AnchorHorizontal anchor)
        {
            return (anchor.IsManual()) ? Style.Center : anchor.Automatic;
        }

        public static implicit operator int(AnchorHorizontal anchor)
        {
            return (anchor.IsManual()) ? anchor.Manual : 0;
        }

        public override string ToString()
        {
            return (IsManual()) ? Manual.ToString() : Automatic.ToString();
        }

        private string DebugValue
        {
            get
            {
                return (IsManual()) ? Manual.ToString() : Automatic.ToString();
            }
        }

    }
}
