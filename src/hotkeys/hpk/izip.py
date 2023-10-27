import zlib


def compress(input):
    c = zlib.compressobj(zlib.Z_DEFAULT_COMPRESSION,
                         zlib.DEFLATED,
                         -zlib.MAX_WBITS,
                         zlib.DEF_MEM_LEVEL,
                         zlib.Z_DEFAULT_STRATEGY)
    output = c.compress(input)
    return output + c.flush()


def decompress(input):
    d = zlib.decompressobj(-zlib.MAX_WBITS)
    output = d.decompress(input)
    return output + d.flush()
