"""Apply the GCC two-phase lookup fix to the upstream test translation unit only."""
from pathlib import Path
import sys
p=Path(sys.argv[1])/'src/applications/osgearth_tests/ExpressionTests.cpp'
s=p.read_text()
needle='#include <osgEarth/Expression>'
replacement='// Declare the existing overload before the template definition (GCC two-phase lookup).\n#include <string>\nnamespace osgEarth {\n    namespace Util { class ScriptEngine; }\n    std::string evaluateExpression(const std::string&, Util::ScriptEngine*);\n}\n#include <osgEarth/Expression>'
if replacement not in s:
    if needle not in s: raise RuntimeError('Pinned source changed; review compatibility patch')
    p.write_text(s.replace(needle,replacement,1))
