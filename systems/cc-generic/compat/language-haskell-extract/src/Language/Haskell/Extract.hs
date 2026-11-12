-- | Stand-in for language-haskell-extract 0.2.4 (same exports and behaviour), written for
-- Sandbox-2's CC-Generic install. 0.2.4 scans every line of the module's source with
-- 'lex' and keeps the names that match a pattern. That also finds functions inside
-- @{- ... -}@ comments, which then fail to compile as out-of-scope variables (CC-Generic's
-- CC/Test/Zipper.hs keeps unfinished list-zipper tests in such a comment). This version
-- removes comments first, then scans the same way.
module Language.Haskell.Extract (
  functionExtractor,
  functionExtractorMap,
  locationModule
) where

import Data.List (nub)
import Language.Haskell.TH
import Text.Regex.Posix ((=~))

-- | Remove nested block comments and line comments, keeping line structure and
-- string literals intact. Pragmas ({-# ... #-}) are block comments too.
stripComments :: String -> String
stripComments = code
  where
    code ('{':'-':rest) = block (1 :: Int) rest
    code ('-':'-':rest) | isLineComment rest = code (dropWhile (/= '\n') rest)
    code ('"':rest) = '"' : str rest
    code ('\'':c:'\'':rest) = '\'' : c : '\'' : code rest
    code (c:rest) = c : code rest
    code [] = []
    -- "--" starts a comment unless it is part of an operator such as "-->"
    isLineComment rest = case dropWhile (== '-') rest of
      (c:_) -> c `notElem` "!#$%&*+./<=>?@\\^|~:"
      []    -> True
    block 0 rest = code rest
    block n ('{':'-':rest) = block (n + 1) rest
    block n ('-':'}':rest) = block (n - 1) rest
    block n ('\n':rest) = '\n' : block n rest
    block n (_:rest) = block n rest
    block _ [] = []
    str ('\\':c:rest) = '\\' : c : str rest
    str ('"':rest) = '"' : code rest
    str (c:rest) = c : str rest
    str [] = []

extractAllFunctions :: String -> Q [String]
extractAllFunctions pattern =
  do loc <- location
     file <- runIO $ readFile $ loc_filename loc
     return $ nub $ filter (=~ pattern) $ map fst $ concatMap lex $ lines $ stripComments file

-- | Extract the names and functions from the current module that match a regular
-- expression, as a list of (name, function) pairs.
functionExtractor :: String -> ExpQ
functionExtractor pattern =
  do functions <- extractAllFunctions pattern
     let makePair n = TupE [LitE $ StringL n, VarE $ mkName n]
     return $ ListE $ map makePair functions

-- | Extract the matching functions and apply a function to every (name, function) pair.
functionExtractorMap :: String -> ExpQ -> ExpQ
functionExtractorMap pattern funcName =
  do functions <- extractAllFunctions pattern
     fn <- funcName
     let makePair n = AppE (AppE fn (LitE $ StringL n)) (VarE $ mkName n)
     return $ ListE $ map makePair functions

-- | The name of the current module, as a string literal.
locationModule :: ExpQ
locationModule =
  do loc <- location
     return $ LitE $ StringL $ loc_module loc
