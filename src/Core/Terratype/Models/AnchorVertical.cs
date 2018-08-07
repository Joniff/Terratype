using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Terratype.Models
{
    [DebuggerDisplay("{DebugValue}")]
    public class AnchorVertical
    {
        public enum Style { Top = -9999, Center, Bottom };
        
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
            return (_value > (int) Style.Bottom) ? true : false;
        }

        public AnchorVertical()
        {
        }

        public AnchorVertical(Style value)
        {
            Automatic = value;
        }

        public AnchorVertical(int value)
        {
            Manual = value;
        }

        public AnchorVertical(string value)
        {
            Automatic = Models.AnchorVertical.Style.Bottom;
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

                case 't':
                case 'T':
                    Automatic = Models.AnchorVertical.Style.Top;
                    break;

                case 'c':
                case 'C':
                case 'm':
                case 'M':
                    Automatic = Models.AnchorVertical.Style.Center;
                    break;
            }
        }

        public static implicit operator AnchorVertical(string value)
        {
            return new AnchorVertical(value);
        }

        public static implicit operator AnchorVertical(Style value)
        {
            return new AnchorVertical(value);
        }

        public static implicit operator AnchorVertical(int value)
        {
            return new AnchorVertical(value);
        }

        public static implicit operator string(AnchorVertical anchor)
        {
            return (anchor.IsManual()) ? anchor.Manual.ToString() : anchor.Automatic.ToString();
        }

        public static implicit operator Style(AnchorVertical anchor)
        {
            return (anchor.IsManual()) ? Style.Center : anchor.Automatic;
        }

        public static implicit operator int(AnchorVertical anchor)
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
