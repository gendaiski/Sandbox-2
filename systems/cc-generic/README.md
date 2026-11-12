# CC-Generic (walkie/CC-Generic)

Eric Walkingshaw's **generic choice calculus**: the Haskell library behind Erwig and Walkingshaw's
work on describing software variation (the "late sharing" version from their TOSEM paper,
last commit 2012-05-14). An expression is a tree whose parts can vary: **dimensions** declare
named alternatives (`dim A<a,b> in ...`), **choices** pick between them (`A<1,2>`), and **let**
shares a subexpression (`let $v = (..) in (..)`). The library parses and pretty-prints
expressions, checks them statically (well-dimensioned, well-referenced, well-formed; free and
bound names), selects tags, computes the semantics (every variant with its decisions), and
offers a generic zipper and random generators.

- Upstream: https://github.com/walkie/CC-Generic, cloned into `vendor/cc-generic` at `fd14f01`.
  It has **no licence file**, so none of its code is copied into this repository.
- **No interface.** It is a library, used from GHCi (Haskell's REPL); upstream has no UI, no
  README and no `.cabal` file.

## Install and use

```bash
systems/cc-generic/setup.sh            # ghcup, GHC 8.8.4, cabal 3.10.3.0; builds the library and its tests
systems/cc-generic/repl.sh             # GHCi with CC, CC.Parser, CC.Pretty, CC.Tree, CC.Zipper, CC.Arbitrary
systems/cc-generic/repl.sh demo.ghci   # the tour below
./run.sh cc-generic -v                 # the test
```

In GHCi:

```haskell
let e = parse "dim A<a,b> in 0{A<1,2>, dim B<c,d> in B<3,A<4,5>>}" :: TreeCC Int
semantics e     -- Right [([("A","a"),("B","c")],0{1,3}), ... 4 variants]
selectTag e ("A","b")
wellFormed (parse "0{A<1,2>}" :: TreeCC Int)   -- Just (NotWellDim (UndefinedDim "A"))
```

## How it is built

`cc-generic.cabal` and `cabal.project` here describe the package (upstream has none) and build
the files in `vendor/cc-generic` unchanged. Three things make 2012 code build today:

| Change | Why |
|---|---|
| GHC 8.8.4 through ghcup | The test generator (test-framework-th) needs language-haskell-extract, whose Template Haskell bound stops at GHC 8.8. The GHC 7.10 and 8.0 installers crash on current Linux. |
| `FlexibleInstances` and `ImpredicativeTypes` turned on in `cc-generic.cabal` | GHC 7 accepted `instance TreeVal String` and `gunfold = error ...` without them. No source file is edited. |
| `compat/language-haskell-extract` | The test generator finds `prop_`/`case_` functions by scanning the module's text, so it also finds the unfinished list-zipper tests that `CC/Test/Zipper.hs` keeps in a `{- ... -}` comment, and the suite fails to compile. This stand-in has the same API as 0.2.4 and strips comments before scanning. |

`hackage_keys.py` puts Hackage's current root keys in cabal's config: they were rotated after
cabal 3.10 shipped, so a fresh `cabal update` would refuse the index.

## Test results

Upstream's suite: **110 of 114 pass**. The 4 failures are upstream's: `prettyParse` cases 33 and 34
(in black-and-white and in colour) pretty-print a `let` that binds a `Bool` inside a tree of
`Int`s, and the parser cannot read it back, because it forces the bound expression to the type of
the body (its own comment there says `-- hack (and wrong)`). The other checks (toolchain, clean
pinned checkout, build, and the library in GHCi) pass.
